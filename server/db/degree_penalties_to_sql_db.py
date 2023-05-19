import os
import sqlite3
import pandas as pd
from typing import List
from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy import select
# Purpose: read all CSVs inside DIRECTORY, load into a database DegreePlanPenalties.db
# Run only once to load csv data into a sql database
# TODO:
# function to delete database for a new load
# probably should move table definitions to a separate module and import into here
# update class definitions with variable annotations 
#    - https://peps.python.org/pep-0526/

# Database Structure
# classes represent tables

# declarative base is a class for building ORM models that we build our custom classes on top of
class Base(DeclarativeBase):
    pass

# association table - links degree plans to courses in a many-to-many relationship
degree_course_association = Table(
    'degree_course_association', 
    Base.metadata,
    Column('degree_plan_id', Integer, ForeignKey('degree_plan.id')),
    Column('course_id', Integer, ForeignKey('course.id'))
)
# Definiton for Degree Plan object
class DegreePlan(Base):
    __tablename__ = "degree_plan"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    overall_avg_c_gpao_pen = Column(String, default="")
    overall_avg_s_gpao_pen = Column(String, default="")

    courses_list: Mapped[List["Course"]] = relationship('Course', secondary=degree_course_association, back_populates='degree_plan_list')

    def __init__(self, name): 
       self.name = name

    # Debug
    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name={self.name!r})"

# Definition for Course object
class Course(Base):
    __tablename__ = "course"
    id: Mapped[int] = mapped_column(primary_key=True)
    course_name: Mapped[str]
    prefix: Mapped[str]
    number: Mapped[str]
    prerequisites = Column(String, default="")
    corequisites = Column(String, default="")
    strict_corequisites = Column(String, default="")
    credit_hours = Column(String, default="")
    institution = Column(String, default="")
    canonical_name = Column(String, default="")
    term = Column(String, default="")
    avg_c_gpao_pen = Column(String, default="")
    avg_s_gpao_pen = Column(String, default="")
    total_students = Column(String, default="")
    most_recent_term = Column(String, default="")
    earliest_term_offered = Column(String, default="")
    grades = Column(String, default="")

    degree_plan_list: Mapped[List["DegreePlan"]] = relationship('DegreePlan', secondary=degree_course_association, back_populates='courses_list')

    def __init__(self, csvRow):
      def normalizeNaN(p):
        # If string is NaN
        if p != p:
          return ""
        return p
      
      self.course_name = csvRow[2]
      self.prefix = csvRow[3]
      self.number = csvRow[4]
      self.prerequisites = normalizeNaN(csvRow[5])
      self.corequisites = normalizeNaN(csvRow[6])
      self.strict_corequisites = normalizeNaN(csvRow[7])
      self.credit_hours = normalizeNaN(csvRow[8])
      self.institution = normalizeNaN(csvRow[9])
      self.canonical_name = normalizeNaN(csvRow[10])
      self.term = normalizeNaN(csvRow[11])
      self.avg_c_gpao_pen = normalizeNaN(csvRow[12])
      self.avg_s_gpao_pen = normalizeNaN(csvRow[13])
      self.total_students = normalizeNaN(csvRow[14])
      self.most_recent_term = normalizeNaN(csvRow[15])
      self.earliest_term_offered = normalizeNaN(csvRow[16])
      self.grades = normalizeNaN(csvRow[17])

    # Debug
    def __repr__(self) -> str:
        return f"Address(id={self.id!r}, course_name={self.course_name!r})"

# Database setup
engine = create_engine("sqlite+pysqlite:///DegreePlanPenalties.db", echo=True) # echo 4 debug
# use definitions as metadata for creating schemas and tables for our database
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

# root dir to loop into
DIRECTORY = 'degree_plans_with_grade_penalty'
# parse out lockfile csvs and special dirs
csv_paths = [filename for filename in os.listdir(DIRECTORY) if not filename.startswith('.')]

for fname in csv_paths:
  f = os.path.join(DIRECTORY, fname)
  # Check if it is a csv file
  if os.path.isfile(f) and f.endswith(".csv"):
      # Create degree plan object to build on
      degree_plan_obj = DegreePlan(fname[:-4])
      df = pd.read_csv(f, skiprows=6)
      for row in df.itertuples():
        # Verify csv row describes a course title by leveraging NaN != NaN
        if row[2] == row[2]:
          course_obj = session.query(Course).filter_by(course_name = row[2]).first()
          # Check if course exists in Course table with unique course name
          if course_obj is None:
            # Make a new course object
            course_obj = Course(row)
            session.add(course_obj)
          # course_obj.degree_plan_list.append(degree_plan_obj) # this course belongs to current degree plan
          degree_plan_obj.courses_list.append(course_obj) # this degree plan contains this course

        # extract bottom row overall stats
        elif row[1] == "Overall Average":
          degree_plan_obj.overall_avg_c_gpao_pen = row[12]
          degree_plan_obj.overall_avg_s_gpao_pen = row[13]

      session.add(degree_plan_obj)

session.commit()
      
