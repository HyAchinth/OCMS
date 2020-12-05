# Database schema

## Tables

### Department

| deptid | adminuser | adminpass | name    |
| :----- | :-------: | :-------: | ------: |
| integer| varchar   | varchar   | varchar |

### Timetable

| sectionid |  year  | semester | department | deptid |
| :-------- | :----: | :------: | :--------: | -----: |
| varchar   | integer| integer  | varchar    | integer|

### Student

|   usn   |  name  | emailid |  year  | semester | password |  deptid  | sectionid |
| :------ | :----: | :-----: | :----: | :------: | :------: | :------: | --------: |
| varchar | varchar| varchar | integer|  integer | varchar  |  integer |  varchar  |

### Follows

|   usn   | sectionid |
| :------ | --------: |
| varchar |  varchar  |  

### FacultyOf

| teacherid |  deptid  |
| :-------- | -------: |
|  varchar  | integer  |

### Teacher

| teacherid |  name  | emailid | password |
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

| eventid | fromtime | totime |  date  |   url   | feedback | classid | sectionid |
| :------ | :------: | :----: | :----: | :-----: | :------: | :-----: | --------: |
| varchar |   time   |  time  |  date  | varchar | varchar  | varchar | varchar   |

### UsesTimetable

| teacherid | sectionid |
| :-------- | --------: |
|  varchar  |   varchar |