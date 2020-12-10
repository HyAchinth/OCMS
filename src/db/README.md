# Database schema

## Tables

### Department

| deptid | adminuser | adminpass |deptname |
| :----- | :-------: | :-------: | ------: |
| integer| varchar   | varchar   | varchar |

### Timetable

| sectionid | yearno | semester | department | deptid |
| :-------- | :----: | :------: | :--------: | -----: |
| varchar   | integer| integer  | varchar    | integer|

### Student

|   usn   |  stname| emailid |  yearno| semester |studentpass|  deptid  | sectionid |
| :------ | :----: | :-----: | :----: | :------: | :------: | :------: | --------: |
| varchar | varchar| varchar | integer|  integer | varchar   |  integer |  varchar  |

### Follows

|   usn   | sectionid |
| :------ | --------: |
| varchar |  varchar  |  

### FacultyOf

| teacherid |  deptid  |
| :-------- | -------: |
|  varchar  | integer  |

### Teacher

| teacherid |  tname  | emailid | pass |
| :-------- | :----: | :-----: | -------: |
|  varchar  | varchar| varchar | varchar  |

### Teaches

| teacherid | classid |
| :-------- | ------: |
|  varchar  | varchar |

### Classroom

| classid | materials | announcements |
| :------ | :-------: | ------------: |
| varchar |  varchar  |    varchar    |

### Attends

|   usn  | classid |
| :----- | ------: |
| varchar| varchar |

### Event

| eventid | fromtime | totime |ondate  |  link   | feedback | classid | sectionid |
| :------ | :------: | :----: | :----: | :-----: | :------: | :-----: | --------: |
| varchar |   time   |  time  |  date  | varchar | varchar  | varchar | varchar   |

### UsesTimetable

| teacherid | sectionid |
| :-------- | --------: |
|  varchar  |   varchar |