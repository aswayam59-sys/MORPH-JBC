"""Database query/repository functions.

Keep SQLAlchemy queries here and use SELECT FOR UPDATE for balances,
products, holdings, and other concurrently modified rows.
"""
