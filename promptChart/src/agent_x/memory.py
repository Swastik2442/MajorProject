"""Memory checkpointer setup for the agent."""

from langgraph.checkpoint.memory import InMemorySaver

# TODO: Setup PostgreSQL-based checkpointer
checkpointer = InMemorySaver()
