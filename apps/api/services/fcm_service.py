"""
Firebase Cloud Messaging (FCM) Service

Handles sending push notifications to mobile devices via Firebase.
"""

import os
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logging.warning("firebase-admin not installed. Push notifications disabled.")

logger = logging.getLogger(__name__)


class FCMService:
    """Firebase Cloud Messaging service for push notifications"""
    
    def __init__(self):
        self.initialized = False
        self.app = None
        
        if not FIREBASE_AVAILABLE:
            logger.warning("Firebase Admin SDK not available")
            return
        
        # Initialize Firebase Admin SDK
        try:
            credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-service-account.json')
            
            if not os.path.exists(credentials_path):
                logger.warning(f"Firebase credentials not found at: {credentials_path}")
                return
            
            # Check if already initialized
            try:
                self.app = firebase_admin.get_app()
                logger.info("Firebase already initialized")
            except ValueError:
                # Not initialized yet
                cred = credentials.Certificate(credentials_path)
                self.app = firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully")
            
            self.initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            self.initialized = False
    
    def is_available(self) -> bool:
        """Check if FCM service is available"""
        return FIREBASE_AVAILABLE and self.initialized
    
    async def send_notification(
        self,
        token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        image_url: Optional[str] = None,
        sound: str = "default",
        badge: Optional[int] = None,
        priority: str = "high"
    ) -> bool:
        """
        Send push notification to a single device
        
        Args:
            token: FCM device token
            title: Notification title
            body: Notification body text
            data: Additional data payload
            image_url: Optional image URL
            sound: Notification sound (default: "default")
            badge: Badge count for iOS
            priority: Notification priority ("high" or "normal")
        
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.is_available():
            logger.warning("FCM not available, skipping notification")
            return False
        
        try:
            # Build notification
            notification = messaging.Notification(
                title=title,
                body=body,
                image=image_url
            )
            
            # Build Android config
            android_config = messaging.AndroidConfig(
                priority=priority,
                notification=messaging.AndroidNotification(
                    sound=sound,
                    channel_id="default",
                    color="#FF6B6B",  # ACT brand color
                    icon="notification_icon",
                )
            )
            
            # Build iOS config
            apns_config = messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound=sound,
                        badge=badge,
                        content_available=True,
                    )
                )
            )
            
            # Build message
            message = messaging.Message(
                token=token,
                notification=notification,
                data=data or {},
                android=android_config,
                apns=apns_config,
            )
            
            # Send message
            response = messaging.send(message)
            logger.info(f"Notification sent successfully: {response}")
            return True
            
        except messaging.UnregisteredError:
            logger.warning(f"Token is invalid or unregistered: {token[:20]}...")
            # Token should be removed from database
            return False
            
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False
    
    async def send_multicast(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        image_url: Optional[str] = None,
        sound: str = "default",
        priority: str = "high"
    ) -> Dict[str, Any]:
        """
        Send push notification to multiple devices
        
        Args:
            tokens: List of FCM device tokens
            title: Notification title
            body: Notification body text
            data: Additional data payload
            image_url: Optional image URL
            sound: Notification sound
            priority: Notification priority
        
        Returns:
            dict: Results with success_count, failure_count, and invalid_tokens
        """
        if not self.is_available():
            logger.warning("FCM not available, skipping multicast")
            return {
                "success_count": 0,
                "failure_count": len(tokens),
                "invalid_tokens": []
            }
        
        if not tokens:
            return {
                "success_count": 0,
                "failure_count": 0,
                "invalid_tokens": []
            }
        
        try:
            # Build notification
            notification = messaging.Notification(
                title=title,
                body=body,
                image=image_url
            )
            
            # Build Android config
            android_config = messaging.AndroidConfig(
                priority=priority,
                notification=messaging.AndroidNotification(
                    sound=sound,
                    channel_id="default",
                    color="#FF6B6B",
                    icon="notification_icon",
                )
            )
            
            # Build multicast message
            message = messaging.MulticastMessage(
                tokens=tokens,
                notification=notification,
                data=data or {},
                android=android_config,
            )
            
            # Send multicast
            response = messaging.send_multicast(message)
            
            # Collect invalid tokens
            invalid_tokens = []
            if response.failure_count > 0:
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        if isinstance(resp.exception, messaging.UnregisteredError):
                            invalid_tokens.append(tokens[idx])
            
            logger.info(
                f"Multicast sent: {response.success_count} success, "
                f"{response.failure_count} failures, "
                f"{len(invalid_tokens)} invalid tokens"
            )
            
            return {
                "success_count": response.success_count,
                "failure_count": response.failure_count,
                "invalid_tokens": invalid_tokens
            }
            
        except Exception as e:
            logger.error(f"Failed to send multicast: {e}")
            return {
                "success_count": 0,
                "failure_count": len(tokens),
                "invalid_tokens": []
            }
    
    async def send_reminder_notification(
        self,
        token: str,
        reminder_title: str,
        reminder_amount: float,
        reminder_id: int,
        currency: str = "USD"
    ) -> bool:
        """
        Send reminder notification
        
        Args:
            token: FCM device token
            reminder_title: Reminder title
            reminder_amount: Reminder amount
            reminder_id: Reminder ID for navigation
            currency: Currency symbol
        
        Returns:
            bool: True if sent successfully
        """
        title = "💰 Reminder"
        body = f"{reminder_title} - {currency} {reminder_amount:.2f}"
        
        data = {
            "type": "reminder",
            "reminder_id": str(reminder_id),
            "screen": "Reminders",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return await self.send_notification(
            token=token,
            title=title,
            body=body,
            data=data,
            sound="default",
            priority="high"
        )
    
    async def send_goal_notification(
        self,
        token: str,
        goal_title: str,
        progress_percentage: float,
        goal_id: int
    ) -> bool:
        """
        Send goal progress notification
        
        Args:
            token: FCM device token
            goal_title: Goal title
            progress_percentage: Current progress percentage
            goal_id: Goal ID for navigation
        
        Returns:
            bool: True if sent successfully
        """
        title = "🎯 Goal Progress"
        body = f"{goal_title} - {progress_percentage:.0f}% complete!"
        
        data = {
            "type": "goal",
            "goal_id": str(goal_id),
            "screen": "Goals",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return await self.send_notification(
            token=token,
            title=title,
            body=body,
            data=data,
            sound="default",
            priority="normal"
        )
    
    async def send_book_notification(
        self,
        token: str,
        book_title: str,
        message: str,
        book_id: int
    ) -> bool:
        """
        Send book-related notification
        
        Args:
            token: FCM device token
            book_title: Book title
            message: Notification message
            book_id: Book ID for navigation
        
        Returns:
            bool: True if sent successfully
        """
        title = f"📚 {book_title}"
        
        data = {
            "type": "book",
            "book_id": str(book_id),
            "screen": "Books",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return await self.send_notification(
            token=token,
            title=title,
            body=message,
            data=data,
            sound="default",
            priority="normal"
        )
    
    async def send_motivational_notification(
        self,
        token: str,
        quote: str,
        author: str
    ) -> bool:
        """
        Send motivational quote notification
        
        Args:
            token: FCM device token
            quote: Motivational quote
            author: Quote author
        
        Returns:
            bool: True if sent successfully
        """
        title = "✨ Daily Motivation"
        body = f'"{quote}" - {author}'
        
        data = {
            "type": "motivation",
            "screen": "Motivation",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return await self.send_notification(
            token=token,
            title=title,
            body=body,
            data=data,
            sound="default",
            priority="normal"
        )


# Global FCM service instance
fcm_service = FCMService()


# Helper functions for easy access
async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None,
    **kwargs
) -> bool:
    """Send push notification (convenience function)"""
    return await fcm_service.send_notification(token, title, body, data, **kwargs)


async def send_push_to_multiple(
    tokens: List[str],
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None,
    **kwargs
) -> Dict[str, Any]:
    """Send push notification to multiple devices (convenience function)"""
    return await fcm_service.send_multicast(tokens, title, body, data, **kwargs)


async def send_reminder_push(
    token: str,
    reminder_title: str,
    reminder_amount: float,
    reminder_id: int,
    currency: str = "USD"
) -> bool:
    """Send reminder notification (convenience function)"""
    return await fcm_service.send_reminder_notification(
        token, reminder_title, reminder_amount, reminder_id, currency
    )