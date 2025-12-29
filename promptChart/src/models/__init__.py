"""Model configurations for an agent."""

from .aws_model import aws_model
from .local_model import local_model

__all__ = ['aws_model', 'local_model']
