from sqlalchemy import Column, Integer, Unicode, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Categories(Base):
    __tablename__ = 'caategories'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Unicode(100), nullable=False)
    words = relationship('Words', back_populates='category')

class Words(Base):
    __tablename__ = 'words'
    id = Column(Integer, primary_key=True, autoincrement=True)
    english = Column(Unicode(100), nullable=False)
    japanese = Column(Unicode(100), nullable=False)
    chinese = Column(Unicode(100), nullable=False)
    category_id = Column(Integer, ForeignKey('caategories.id'))
    category = relationship('Categories', back_populates='words')

class Phrases(Base):
    __tablename__ = 'phrases'
    id = Column(Integer, primary_key=True, autoincrement=True)
    english = Column(Unicode(100), nullable=False)
    japanese = Column(Unicode(100), nullable=False)
    chinese = Column(Unicode(100), nullable=False)
