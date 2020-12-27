

CREATE TABLE department(
    deptid INT AUTO_INCREMENT PRIMARY KEY,
    deptname VARCHAR(255) ,
    adminuser VARCHAR(255),
    adminpass VARCHAR(255)    
);

CREATE TABLE timetable(
    sectionid varchar(255) PRIMARY KEY,
    yearno INT,
    semester INT,
    deptname VARCHAR(255),
    deptid INT,
    FOREIGN KEY(deptid) REFERENCES department(deptid) ON DELETE CASCADE
);

CREATE TABLE student(
    usn VARCHAR(255) PRIMARY KEY,
    stname VARCHAR(255),
    emailid VARCHAR(255),
    yearno INT,
    semester INT,
    studentpass VARCHAR(255),
    deptid INT,
    sectionid VARCHAR(255),
    FOREIGN KEY(deptid) REFERENCES department(deptid) ON DELETE CASCADE,
    FOREIGN KEY(sectionid) REFERENCES timetable(sectionid) ON DELETE CASCADE     
);

CREATE TABLE follows(
    usn VARCHAR(255),
    sectionid VARCHAR(255),
    PRIMARY KEY(usn,sectionid),
    FOREIGN KEY(usn) REFERENCES student(usn) ON DELETE CASCADE,
    FOREIGN KEY(sectionid) REFERENCES timetable(sectionid) ON DELETE CASCADE
);

CREATE TABLE teacher(
    teacherid VARCHAR(255) PRIMARY KEY,
    tname VARCHAR(255),
    emailid VARCHAR(255),
    pass VARCHAR(255)    
);



CREATE TABLE facultyof(
    teacherid VARCHAR(255),
    deptid INT,
    PRIMARY KEY(teacherid,deptid),
    FOREIGN KEY(teacherid) REFERENCES teacher(teacherid) ON DELETE CASCADE,
    FOREIGN KEY(deptid) REFERENCES department(deptid) ON DELETE CASCADE
);


CREATE TABLE classroom(
    classid VARCHAR(255) PRIMARY KEY,
    materials VARCHAR(255),
    announcements VARCHAR(255),
    classname varchar(255)
);

CREATE TABLE teaches(
    teacherid VARCHAR(255),
    classid VARCHAR(255),
    PRIMARY KEY(teacherid,classid),
    FOREIGN KEY(teacherid) REFERENCES teacher(teacherid) ON DELETE CASCADE,
    FOREIGN KEY(classid) REFERENCES classroom(classid) ON DELETE CASCADE
);



CREATE TABLE attends(
    usn VARCHAR(255),
    classid VARCHAR(255),
    PRIMARY KEY(usn,classid),
    FOREIGN KEY(usn) REFERENCES student(usn) ON DELETE CASCADE,
    FOREIGN KEY(classid) REFERENCES classroom(classid) ON DELETE CASCADE
);

CREATE TABLE events(
    eventid VARCHAR(255) PRIMARY KEY,
    fromtime TIME,
    totime TIME,
    ondate DATE,
    link VARCHAR(255),
    feedback VARCHAR(255),
    classid VARCHAR(255),
    sectionid VARCHAR(255),
    FOREIGN KEY(classid) REFERENCES classroom(classid) ON DELETE CASCADE,
    FOREIGN KEY(sectionid) REFERENCES timetable(sectionid) ON DELETE CASCADE
);

CREATE TABLE usestt(
    teacherid VARCHAR(255),
    sectionid VARCHAR(255),
    PRIMARY KEY(teacherid,sectionid),
    FOREIGN KEY(teacherid) REFERENCES teacher(teacherid) ON DELETE CASCADE,
    FOREIGN KEY(sectionid) REFERENCES timetable(sectionid) ON DELETE CASCADE
);

CREATE TABLE material(
    materialid integer not null auto_increment PRIMARY KEY,
    materialname VARCHAR(255) not null,
    classid VARCHAR(255),
    FOREIGN KEY(classid) REFERENCES classroom(classid) ON DELETE CASCADE
);

CREATE TABLE announcements(
    aid integer not null auto_increment PRIMARY KEY,
    classid VARCHAR(255),
    announcement TEXT,
    dtime DATETIME,
    FOREIGN KEY(classid) REFERENCES classroom(classid) ON DELETE CASCADE 
);
