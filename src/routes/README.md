# Access point routes

## Routes 

## TOC

- [Access point routes](#access-point-routes)
  - [TOC](#toc)
  - [Student](#student)
    - [Register student](#register-student)
    - [Login student](#login-student)
    - [Logout student](#logout-student)
    - [Logout all students](#logout-all-students)

## Student

### Register student

**Requires valid Authorization token**
Endpoint: PUT /api/student 
#### Sample Request Body:
```json
{
    "usn": "1RV18CS007",
    "name": "Achinthya S",
    "email": "achinthyas.cs18@rvce.edu.in",
    "year": 3,
    "sem": 5,
    "password": "eynsaA722dmdskddsdmksd",
    "dept": 3,
    "section": 4,
}
```
##### Notes 
- USN, email are to be unique
- Password is a unique hash
- Department is an integer referencing to deptid of Department table
- Section is an integer referencing to sectid of Timetable table

#### Sample success body

```json
{
    "ok":true,
    "usn": "1RV18CS019"
}
```
On success, the input usn is returned

### Login student

### Logout student

### Logout all students