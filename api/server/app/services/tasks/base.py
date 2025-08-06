from abc import ABC, abstractmethod
from typing import Any, Dict, Callable
from enum import Enum


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskExecutor(ABC):
    @abstractmethod
    async def execute(
        self, 
        task_name: str, 
        payload: Dict[str, Any],
        priority: TaskPriority = TaskPriority.MEDIUM
    ) -> None:
        pass
    
    @abstractmethod
    async def schedule(
        self,
        task_name: str,
        payload: Dict[str, Any],
        delay_seconds: int,
        priority: TaskPriority = TaskPriority.MEDIUM
    ) -> None:
        pass
    
    @abstractmethod
    def register_task(self, task_name: str, task_function: Callable):
        pass