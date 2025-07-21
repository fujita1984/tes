from sqlalchemy import Column, Integer, Unicode, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Categories(Base):
    __tablename__ = 'categories' 
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Unicode(100), nullable=False)
    words = relationship('Words', back_populates='category')

class Words(Base):
    __tablename__ = 'words'
    id = Column(Integer, primary_key=True, autoincrement=True)
    english = Column(Unicode(100), nullable=False)
    japanese = Column(Unicode(100), nullable=False)
    chinese = Column(Unicode(100), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))  
    category = relationship('Categories', back_populates='words')

class HskWords(Base):
    __tablename__ = 'hsk_words'
    id = Column(Integer, primary_key=True, autoincrement=True)
    chinese = Column(Unicode(100), nullable=False)
    pinyin = Column(Unicode(100), nullable=False)
    pinyin_with_tone = Column(Unicode(100), nullable=False)
    japanese_meaning = Column(Unicode(200), nullable=False)
    hsk_level = Column(Integer, nullable=False)