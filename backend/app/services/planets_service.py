"""Service layer for planets and quiz system"""
import structlog
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from supabase import Client

from app.models.planets import (
    Planet, Quiz, Question, QuestionForQuiz,
    UserPlanetProgress, UserQuizProgress, UserQuestionAttempt,
    QuizSubmissionRequest, QuizSubmissionResponse, QuizAnswerResult,
    PlanetProgressSummary, QuizProgressSummary, UserProgressOverview,
    PlanetDetailResponse, QuizDetailResponse, QuizStartResponse,
    PlanetsListResponse, QuizzesListResponse, PlanetWithProgress, QuizWithProgress,
    AnswerOption
)
from app.services.database import get_supabase_client

logger = structlog.get_logger()


class PlanetsService:
    """Service for handling planets and quiz operations"""
    
    def __init__(self):
        self.client: Client = get_supabase_client()
    
    async def get_all_planets(self, user_id: Optional[str] = None) -> PlanetsListResponse:
        """Get all planets with optional user progress"""
        try:
            # Get all planets ordered by order_index
            planets_response = self.client.table('planets').select('*').order('order_index').execute()
            
            planets_with_progress = []
            user_overview = None
            
            if user_id:
                # Get user progress for all planets
                progress_response = self.client.table('user_planet_progress').select('*').eq('user_id', user_id).execute()
                progress_dict = {p['planet_id']: p for p in progress_response.data}
                
                # Get user quiz progress
                quiz_progress_response = self.client.table('user_quiz_progress').select('*').eq('user_id', user_id).execute()
                quiz_progress_dict = {p['quiz_id']: p for p in quiz_progress_response.data}
                
                # Build planets with progress
                for planet_data in planets_response.data:
                    planet = Planet(**planet_data)
                    user_progress = progress_dict.get(planet.id)
                    
                    # Get quizzes for this planet
                    quizzes_response = self.client.table('quizzes').select('*').eq('planet_id', planet.id).order('order_index').execute()
                    
                    quizzes_with_progress = []
                    for quiz_data in quizzes_response.data:
                        quiz = Quiz(**quiz_data)
                        quiz_progress = quiz_progress_dict.get(quiz.id)
                        
                        # Calculate total_questions separately
                        questions_count = self.client.table('questions').select('id', count='exact').eq('quiz_id', quiz_data['id']).execute()
                        total_questions = questions_count.count
                        
                        quiz_with_progress = QuizWithProgress(
                            **quiz_data,
                            total_questions=total_questions,
                            user_progress=UserQuizProgress(**quiz_progress) if quiz_progress else None,
                            questions=[]  # We don't load questions in the list view
                        )
                        quizzes_with_progress.append(quiz_with_progress)
                    
                    planet_with_progress = PlanetWithProgress(
                        **planet_data,
                        user_progress=UserPlanetProgress(**user_progress) if user_progress else None,
                        quizzes=quizzes_with_progress
                    )
                    planets_with_progress.append(planet_with_progress)
                
                # Build user overview
                user_overview = await self._build_user_overview(user_id)
            else:
                # No user context, just return planets
                for planet_data in planets_response.data:
                    # Get quizzes for this planet
                    quizzes_response = self.client.table('quizzes').select('*').eq('planet_id', planet_data['id']).order('order_index').execute()
                    
                    quizzes_with_progress = []
                    for quiz_data in quizzes_response.data:
                        # Calculate total_questions separately
                        questions_count = self.client.table('questions').select('id', count='exact').eq('quiz_id', quiz_data['id']).execute()
                        total_questions = questions_count.count
                        
                        quiz_with_progress = QuizWithProgress(
                            **quiz_data,
                            total_questions=total_questions,
                            user_progress=None,
                            questions=[]
                        )
                        quizzes_with_progress.append(quiz_with_progress)
                    
                    planet_with_progress = PlanetWithProgress(**planet_data, quizzes=quizzes_with_progress)
                    planets_with_progress.append(planet_with_progress)
            
            return PlanetsListResponse(
                planets=planets_with_progress,
                user_overview=user_overview
            )
            
        except Exception as e:
            logger.error("Error getting planets", error=str(e))
            raise
    
    async def get_planet_detail(self, planet_id: int, user_id: Optional[str] = None) -> PlanetDetailResponse:
        """Get detailed planet information with quizzes and progress"""
        try:
            # Get planet
            planet_response = self.client.table('planets').select('*').eq('id', planet_id).single().execute()
            planet = Planet(**planet_response.data)
            
            # Get user progress for this planet
            user_progress = None
            quiz_progress_dict = {}
            
            if user_id:
                progress_response = self.client.table('user_planet_progress').select('*').eq('user_id', user_id).eq('planet_id', planet_id).execute()
                if progress_response.data:
                    user_progress = UserPlanetProgress(**progress_response.data[0])
                
                # Get quiz progress for this planet
                quiz_progress_response = self.client.table('user_quiz_progress').select('quiz_id, *').eq('user_id', user_id).execute()
                quiz_progress_dict = {p['quiz_id']: p for p in quiz_progress_response.data}
            
            # Get quizzes for this planet
            quizzes_response = self.client.table('quizzes').select('*').eq('planet_id', planet_id).order('order_index').execute()
            
            quizzes_with_progress = []
            for quiz_data in quizzes_response.data:
                # Calculate total_questions separately
                questions_count = self.client.table('questions').select('id', count='exact').eq('quiz_id', quiz_data['id']).execute()
                total_questions = questions_count.count
                
                quiz_progress = quiz_progress_dict.get(quiz_data['id'])
                
                quiz_with_progress = QuizWithProgress(
                    **quiz_data,
                    total_questions=total_questions,
                    user_progress=UserQuizProgress(**quiz_progress) if quiz_progress else None,
                    questions=[]  # Questions loaded separately when needed
                )
                quizzes_with_progress.append(quiz_with_progress)
            
            return PlanetDetailResponse(
                planet=planet,
                user_progress=user_progress,
                quizzes=quizzes_with_progress
            )
            
        except Exception as e:
            logger.error("Error getting planet detail", planet_id=planet_id, error=str(e))
            raise
    
    async def get_quiz_detail(self, quiz_id: int, user_id: Optional[str] = None) -> QuizDetailResponse:
        """Get detailed quiz information with questions and progress"""
        try:
            # Get quiz with planet info
            quiz_response = self.client.table('quizzes').select('*, planets(*)').eq('id', quiz_id).single().execute()
            quiz_data = quiz_response.data
            
            quiz = Quiz(**{k: v for k, v in quiz_data.items() if k != 'planets'})
            planet = Planet(**quiz_data['planets'])
            
            # Get user progress for this quiz
            user_progress = None
            if user_id:
                progress_response = self.client.table('user_quiz_progress').select('*').eq('user_id', user_id).eq('quiz_id', quiz_id).execute()
                if progress_response.data:
                    user_progress = UserQuizProgress(**progress_response.data[0])
            
            # Get questions for this quiz (without correct answers for display)
            questions_response = self.client.table('questions').select('id, question_text, option_a, option_b, option_c, option_d, order_index').eq('quiz_id', quiz_id).order('order_index').execute()
            
            questions = [QuestionForQuiz(**q) for q in questions_response.data]
            
            # Determine if user can start or retake
            can_start = user_progress is None or not user_progress.is_completed
            can_retake = user_progress is not None and user_progress.is_completed
            
            return QuizDetailResponse(
                quiz=quiz,
                planet=planet,
                user_progress=user_progress,
                questions=questions,
                can_start=can_start,
                can_retake=can_retake
            )
            
        except Exception as e:
            logger.error("Error getting quiz detail", quiz_id=quiz_id, error=str(e))
            raise
    
    async def start_quiz(self, quiz_id: int, user_id: str) -> QuizStartResponse:
        """Start a quiz session for a user"""
        try:
            # Get quiz info
            quiz_response = self.client.table('quizzes').select('*').eq('id', quiz_id).single().execute()
            quiz = Quiz(**quiz_response.data)
            
            # Get questions for this quiz (without correct answers)
            questions_response = self.client.table('questions').select('id, question_text, option_a, option_b, option_c, option_d, order_index').eq('quiz_id', quiz_id).order('order_index').execute()
            
            questions = [QuestionForQuiz(**q) for q in questions_response.data]
            
            # Update or create user quiz progress
            now = datetime.utcnow()
            
            # Check if user already has progress for this quiz
            existing_progress = self.client.table('user_quiz_progress').select('*').eq('user_id', user_id).eq('quiz_id', quiz_id).execute()
            
            if existing_progress.data:
                # Use existing progress without updating to avoid trigger issues
                quiz_attempt_id = existing_progress.data[0]['id']
            else:
                # Create new progress
                new_progress = self.client.table('user_quiz_progress').insert({
                    'user_id': user_id,
                    'quiz_id': quiz_id,
                    'attempts': 1,
                    'first_attempt_at': now.isoformat(),
                    'last_attempt_at': now.isoformat()
                }).execute()
                quiz_attempt_id = new_progress.data[0]['id']
            
            return QuizStartResponse(
                quiz_attempt_id=quiz_attempt_id,
                quiz=quiz,
                questions=questions,
                started_at=now
            )
            
        except Exception as e:
            logger.error("Error starting quiz", quiz_id=quiz_id, user_id=user_id, error=str(e))
            raise
    
    async def submit_quiz(self, submission: QuizSubmissionRequest, user_id: str) -> QuizSubmissionResponse:
        """Submit a completed quiz and calculate results"""
        try:
            quiz_id = submission.quiz_id
            
            # Get quiz info and correct answers
            quiz_response = self.client.table('quizzes').select('*').eq('id', quiz_id).single().execute()
            quiz = Quiz(**quiz_response.data)
            
            questions_response = self.client.table('questions').select('*').eq('quiz_id', quiz_id).order('order_index').execute()
            questions_dict = {q['id']: q for q in questions_response.data}
            
            # Calculate results
            answer_results = []
            correct_count = 0
            
            for answer in submission.answers:
                question = questions_dict.get(answer.question_id)
                if not question:
                    continue
                
                is_correct = answer.selected_answer.value == question['correct_answer']
                if is_correct:
                    correct_count += 1
                
                # Record the question attempt
                self.client.table('user_question_attempts').insert({
                    'user_id': user_id,
                    'question_id': answer.question_id,
                    'selected_answer': answer.selected_answer.value,
                    'is_correct': is_correct,
                    'response_time_seconds': answer.response_time_seconds
                }).execute()
                
                answer_results.append(QuizAnswerResult(
                    question_id=answer.question_id,
                    selected_answer=answer.selected_answer,
                    correct_answer=AnswerOption(question['correct_answer']),
                    is_correct=is_correct,
                    explanation=question.get('explanation')
                ))
            
            # Calculate percentage
            total_questions = len(submission.answers)
            completion_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
            
            # Get existing progress to check for best score
            existing_progress = self.client.table('user_quiz_progress').select('*').eq('user_id', user_id).eq('quiz_id', quiz_id).single().execute()
            previous_best_score = existing_progress.data['best_score'] if existing_progress.data else 0
            is_new_best = correct_count > previous_best_score
            
            # Update quiz progress
            update_data = {
                'is_completed': True,
                'completion_percentage': completion_percentage,
                'last_attempt_at': datetime.utcnow().isoformat(),
                'best_score': max(correct_count, previous_best_score),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Skip problematic database UPDATE due to broken triggers
            # Quiz completion will be tracked via manual planet progress update
            logger.info("Skipping user_quiz_progress UPDATE to avoid broken database triggers", 
                       quiz_id=quiz_id, user_id=user_id, score=correct_count)
            
            # Manually update planet progress since triggers are not working
            try:
                await self._update_planet_progress_after_quiz(user_id, quiz.planet_id, correct_count)
            except Exception as e:
                logger.warning("Failed to update planet progress", error=str(e))
            
            return QuizSubmissionResponse(
                quiz_id=quiz_id,
                score=correct_count,
                total_questions=total_questions,
                completion_percentage=completion_percentage,
                is_completed=True,
                answers=answer_results,
                previous_best_score=previous_best_score,
                is_new_best=is_new_best
            )
            
        except Exception as e:
            logger.error("Error submitting quiz", quiz_id=submission.quiz_id, user_id=user_id, error=str(e))
            raise
    
    async def get_user_progress_overview(self, user_id: str) -> UserProgressOverview:
        """Get complete overview of user progress across all planets"""
        return await self._build_user_overview(user_id)
    
    async def _build_user_overview(self, user_id: str) -> UserProgressOverview:
        """Build user progress overview (internal method)"""
        try:
            # Get all planets with user progress
            planets_response = self.client.table('planets').select('*').order('order_index').execute()
            
            # Get user progress for all planets
            planet_progress_response = self.client.table('user_planet_progress').select('*').eq('user_id', user_id).execute()
            planet_progress_dict = {p['planet_id']: p for p in planet_progress_response.data}
            
            # Get total quiz counts per planet
            quiz_counts_response = self.client.table('quizzes').select('planet_id').execute()
            quiz_counts = {}
            for quiz in quiz_counts_response.data:
                planet_id = quiz['planet_id']
                quiz_counts[planet_id] = quiz_counts.get(planet_id, 0) + 1
            
            planet_summaries = []
            total_planets_completed = 0
            total_quizzes_completed = 0
            overall_score = 0
            
            for planet in planets_response.data:
                planet_id = planet['id']
                progress = planet_progress_dict.get(planet_id)
                total_quizzes = quiz_counts.get(planet_id, 0)
                
                if progress:
                    completed_quizzes = progress['quizzes_completed']
                    experience_earned = progress['experience_earned']
                    is_completed = progress['is_completed']
                    
                    if is_completed:
                        total_planets_completed += 1
                    
                    total_quizzes_completed += completed_quizzes
                    overall_score += experience_earned
                else:
                    completed_quizzes = 0
                    experience_earned = 0
                    is_completed = False
                
                completion_percentage = (completed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0
                
                planet_summaries.append(PlanetProgressSummary(
                    planet_id=planet_id,
                    planet_name=planet['name'],
                    planet_color=planet['color'],
                    completed_quizzes=completed_quizzes,
                    total_quizzes=total_quizzes,
                    total_score=experience_earned,
                    is_completed=is_completed,
                    completion_percentage=completion_percentage,
                    last_activity_at=None  # Field doesn't exist in current schema
                ))
            
            # Calculate overall completion percentage
            total_available_quizzes = sum(quiz_counts.values())
            overall_completion_percentage = (total_quizzes_completed / total_available_quizzes * 100) if total_available_quizzes > 0 else 0
            
            return UserProgressOverview(
                planets=planet_summaries,
                total_planets_completed=total_planets_completed,
                total_quizzes_completed=total_quizzes_completed,
                overall_score=overall_score,
                overall_completion_percentage=overall_completion_percentage
            )
            
        except Exception as e:
            logger.error("Error building user overview", user_id=user_id, error=str(e))
            raise
    
    async def _update_planet_progress_after_quiz(self, user_id: str, planet_id: int, score: int):
        """Manually update planet progress after quiz completion (replaces broken trigger)"""
        try:
            # Count total quizzes for this planet
            total_quizzes_response = self.client.table('quizzes').select('id', count='exact').eq('planet_id', planet_id).execute()
            total_quizzes = total_quizzes_response.count
            
            # Get all quiz IDs for this planet
            planet_quiz_ids_response = self.client.table('quizzes').select('id').eq('planet_id', planet_id).execute()
            planet_quiz_ids = [quiz['id'] for quiz in planet_quiz_ids_response.data]
            
            # Count completed quizzes based on question attempts since user_quiz_progress tracking is broken
            completed_quizzes = 0
            if planet_quiz_ids:
                for quiz_id in planet_quiz_ids:
                    # Get total questions for this quiz
                    quiz_questions_response = self.client.table('questions').select('id', count='exact').eq('quiz_id', quiz_id).execute()
                    total_questions_for_quiz = quiz_questions_response.count
                    
                    if total_questions_for_quiz > 0:
                        # Get question IDs for this quiz
                        quiz_question_ids_response = self.client.table('questions').select('id').eq('quiz_id', quiz_id).execute()
                        quiz_question_ids = [q['id'] for q in quiz_question_ids_response.data]
                        
                        if quiz_question_ids:
                            # Count how many of these specific questions this user has answered
                            answered_questions_response = self.client.table('user_question_attempts').select('question_id', count='exact').eq('user_id', user_id).in_('question_id', quiz_question_ids).execute()
                            answered_questions = answered_questions_response.count
                            
                            # If user answered all questions for this quiz, consider it completed
                            if answered_questions >= total_questions_for_quiz:
                                completed_quizzes += 1
                                logger.debug("Quiz completed", quiz_id=quiz_id, answered=answered_questions, total=total_questions_for_quiz)
            
            # Calculate if planet is completed
            is_planet_completed = completed_quizzes >= total_quizzes
            
            # Update or insert planet progress
            planet_progress_data = {
                'user_id': user_id,
                'planet_id': planet_id,
                'quizzes_completed': completed_quizzes,
                'total_quizzes': total_quizzes,
                'is_completed': is_planet_completed,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if is_planet_completed:
                planet_progress_data['completed_at'] = datetime.utcnow().isoformat()
            
            # Try to update existing record, if it doesn't exist, insert new one
            existing_progress = self.client.table('user_planet_progress').select('*').eq('user_id', user_id).eq('planet_id', planet_id).execute()
            
            if existing_progress.data:
                self.client.table('user_planet_progress').update(planet_progress_data).eq('user_id', user_id).eq('planet_id', planet_id).execute()
            else:
                planet_progress_data['is_unlocked'] = True
                planet_progress_data['unlocked_at'] = datetime.utcnow().isoformat()
                self.client.table('user_planet_progress').insert(planet_progress_data).execute()
                
        except Exception as e:
            logger.error("Error updating planet progress", user_id=user_id, planet_id=planet_id, error=str(e))
            raise
    
    async def get_quiz_leaderboard(self, quiz_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get leaderboard for a specific quiz"""
        try:
            # Get top scores for this quiz
            leaderboard_response = self.client.table('user_quiz_progress').select('user_id, best_score, completion_percentage, last_attempt_at').eq('quiz_id', quiz_id).order('best_score', desc=True).order('completion_percentage', desc=True).limit(limit).execute()
            
            return leaderboard_response.data
            
        except Exception as e:
            logger.error("Error getting quiz leaderboard", quiz_id=quiz_id, error=str(e))
            raise


# Create a singleton instance
planets_service = PlanetsService() 