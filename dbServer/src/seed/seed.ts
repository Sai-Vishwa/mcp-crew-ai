import { connectMaster } from "../connector/connectMaster";

async function seedDB() {
  const connection = await connectMaster();

  await connection.query(`DROP TABLE IF EXISTS teacher`);
  await connection.query(`DROP TABLE IF EXISTS marks`);
  await connection.query(`DROP TABLE IF EXISTS access`);
  await connection.query(`DROP TABLE IF EXISTS tools`);
  await connection.query(`DROP TABLE IF EXISTS session`);
  await connection.query(`DROP TABLE IF EXISTS auth`);
  await connection.query(`DROP TABLE IF EXISTS chathistory`);
  await connection.query(`DROP TABLE IF EXISTS chat`);


  await connection.query(`
    CREATE TABLE auth (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      uname VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      role ENUM('student', 'teacher', 'principal') NOT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE session (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session VARCHAR(100) NOT NULL,
      uname VARCHAR(100) NOT NULL,
      FOREIGN KEY (uname) REFERENCES auth(uname) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE tools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(255) DEFAULT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE access (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tool_id INT,
      user_type ENUM('student', 'teacher', 'principal') NOT NULL,
      FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE marks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uname VARCHAR(100) NOT NULL,
      name VARCHAR(100),
      marks INT,
      FOREIGN KEY (uname) REFERENCES auth(uname) ON DELETE CASCADE
    )
  `);


  await connection.query(`
  CREATE TABLE chathistory (
    chatid INT AUTO_INCREMENT PRIMARY KEY,
    uname VARCHAR(100) NOT NULL,
    lastchatdate DATETIME NOT NULL,
    chatName VARCHAR(100) NOT NULL,
    FOREIGN KEY (uname) REFERENCES auth(uname) ON DELETE CASCADE
  )
`);

await connection.query(`
  CREATE TABLE chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chatid INT NOT NULL,
    ques TEXT NOT NULL,
    ans TEXT NOT NULL,
    q_time DATETIME NOT NULL,
    FOREIGN KEY (chatid) REFERENCES chathistory(chatid) ON DELETE CASCADE
  )
`);


  await connection.query(`
    INSERT INTO auth (name , uname, password, role) VALUES
    ('Prasanth' , 'StPrasanth1' , 'iLoveJ' , 'student'),
    ('Bala' , 'StBala1' , 'Pondy' , 'student'),
    ('Sharan' , 'StSharan1' , 'Kanguva' , 'student'),
    ('Ruben' , 'StRuben1' , 'LionBen' , 'student'),
    ('Sanjeev' , 'StSanjeev1' , 'Senior' , 'student'),
    ('Teacher1' , 'TeTeacher1' , 'ABCD' , 'teacher'),
    ('Teacher2' , 'TeTeacher2' , 'ABCD' , 'teacher'),
    ('Principal1' , 'PrPrincipal1' , 'LeoDass' , 'principal')
  `);

    await connection.query(`
  INSERT INTO tools (name, description) VALUES
  ('Fetch_All_Marks', 'Fetches the marks of all students from the database'),
  ('Fetch_One_Mark', 'Fetches the mark of a specific student based on their ID'),
  ('Fetch_Marks_In_A_Range', 'Fetches marks of students that fall within a specified range'),
  ('Create_A_Student', 'Creates a new student entry in the database'),
  ('Delete_A_Student', 'Deletes a student from the database using their ID'),
  ('Update_Student_Mark', 'Updates the mark of an existing student'),
  ('Create_A_Teacher', 'Creates a new teacher entry in the database'),
  ('Delete_A_Teacher', 'Deletes a teacher from the database using their ID')
`);


  // Seed access table
  await connection.query(`
    INSERT INTO access (tool_id, user_type) VALUES
    (1, 'teacher'),
    (1, 'principal'),
    (2, 'student'),
    (2, 'teacher'),
    (2, 'principal'),
    (3, 'teacher'),
    (3, 'principal'),
    (4, 'principal'),
    (5, 'principal'),
    (6, 'teacher'),
    (7, 'principal'),
    (8, 'principal')
  `);

  await connection.query(`INSERT INTO marks (uname, name, marks) VALUES 
    ('StPrasanth1', 'Prasanth', 85),
    ('StBala1', 'Bala', 90),
    ('StSharan1', 'Sharan', 49),
    ('StRuben1', 'Ruben' , 60),
    ('StSanjeev1', 'Sanjeev', 12)
  `);


  console.log('✅ Database seeded successfully');
  await connection.end();
}

seedDB().catch(console.error);
