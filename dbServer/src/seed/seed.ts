import { connectMaster } from "../connector/connectMaster.js";
async function seedDB() {
    const connection = await connectMaster();
    // Drop tables if exist
    await connection.query(`DROP TABLE IF EXISTS access`);
    await connection.query(`DROP TABLE IF EXISTS specialaccess`);
    await connection.query(`DROP TABLE IF EXISTS tools`);
    await connection.query(`DROP TABLE IF EXISTS placement`);
    await connection.query(`DROP TABLE IF EXISTS examcell`);
    await connection.query(`DROP TABLE IF EXISTS transport`);
    await connection.query(`DROP TABLE IF EXISTS teacher`);
    await connection.query(`DROP TABLE IF EXISTS marks`);
    await connection.query(`DROP TABLE IF EXISTS chat`);
    await connection.query(`DROP TABLE IF EXISTS chathistory`);
    await connection.query(`DROP TABLE IF EXISTS specialaccess`);
    await connection.query(`DROP TABLE IF EXISTS session`);
    await connection.query(`DROP TABLE IF EXISTS auth`);

    // Auth table with placement, exam-cell, transport roles
    await connection.query(`
    CREATE TABLE auth (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      uname VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      role ENUM('placement', 'examcell', 'transport') NOT NULL
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
    CREATE TABLE session (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session VARCHAR(100) NOT NULL,
      uname VARCHAR(100) NOT NULL,
      FOREIGN KEY (uname) REFERENCES auth(uname) ON DELETE CASCADE
    )
  `);
    // Placement table
    await connection.query(`
    CREATE TABLE placement (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(100) NOT NULL,
      visiting_date DATE NOT NULL,
      interview_start TIME NOT NULL,
      interview_end TIME NOT NULL
    )
  `);
    // Exam Cell table
    await connection.query(`
    CREATE TABLE examcell (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_date DATE NOT NULL,
      exam_start TIME NOT NULL,
      exam_end TIME NOT NULL
    )
  `);
    // Transport table
    await connection.query(`
    CREATE TABLE transport (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bus_date DATE NOT NULL,
      start_time TIME NOT NULL,
      leave_time TIME NOT NULL
    )
  `);
    // Tools table
    await connection.query(`
    CREATE TABLE tools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(255) DEFAULT NULL
    )
  `);
    // Access table
    await connection.query(`
    CREATE TABLE access (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tool_id INT,
      user_type ENUM('placement', 'examcell', 'transport') NOT NULL,
      FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
    )
  `);
    await connection.query(`
    CREATE TABLE specialaccess (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tool_id INT,
      uname VARCHAR(100) NOT NULL,
      FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
      FOREIGN KEY (uname) REFERENCES auth(uname) ON DELETE CASCADE
    )
  `);
    // Insert users
    await connection.query(`
    INSERT INTO auth (name , uname, password, role) VALUES
    ('Placement Officer' , 'PlOfficer1' , 'place123' , 'placement'),
    ('Exam Cell Officer' , 'ExOfficer1' , 'exam123' , 'examcell'),
    ('Transport Officer' , 'TrOfficer1' , 'bus123' , 'transport')
  `);
    // Insert tools (12 CRUD operations across 3 tables)
    await connection.query(`
    INSERT INTO tools (name, description) VALUES
    ('Create_Placement', 'Create a new placement entry'),
    ('Read_Placement', 'Fetch placement entries'),
    ('Update_Placement', 'Update placement entry'),
    ('Delete_Placement', 'Delete placement entry'),

    ('Create_ExamCell', 'Create a new exam entry'),
    ('Read_ExamCell', 'Fetch exam entries'),
    ('Update_ExamCell', 'Update exam entry'),
    ('Delete_ExamCell', 'Delete exam entry'),

    ('Create_Transport', 'Create a new transport entry'),
    ('Read_Transport', 'Fetch transport entries'),
    ('Update_Transport', 'Update transport entry'),
    ('Delete_Transport', 'Delete transport entry')
  `);
    // Access rules
    await connection.query(`
    INSERT INTO access (tool_id, user_type) VALUES
    -- placement role -> all 12 tools
    (1, 'placement'), (2, 'placement'), (3, 'placement'), (4, 'placement'),
    (5, 'placement'), (6, 'placement'), (7, 'placement'), (8, 'placement'),
    (9, 'placement'), (10, 'placement'), (11, 'placement'), (12, 'placement'),

    -- examcell role -> CRUD examcell (5-8), CRUD transport (9-12), Read placement (2)
    (5, 'examcell'), (6, 'examcell'), (7, 'examcell'), (8, 'examcell'),
    (9, 'examcell'), (10, 'examcell'), (11, 'examcell'), (12, 'examcell'),
    (2, 'examcell'),

    -- transport role -> CRUD transport (9-12), Read examcell (6), Read placement (2)
    (9, 'transport'), (10, 'transport'), (11, 'transport'), (12, 'transport'),
    (6, 'transport'), (2, 'transport')
  `);
    // Insert some sample data
    await connection.query(`
    INSERT INTO placement (company_name, visiting_date, interview_start, interview_end) VALUES
    ('ABC', '2025-09-01', '09:00:00', '12:00:00'),
    ('DEF', '2025-09-02', '10:00:00', '14:00:00')
  `);
    await connection.query(`
    INSERT INTO examcell (exam_date, exam_start, exam_end) VALUES
    ('2025-09-03', '09:00:00', '12:00:00'),
    ('2025-09-04', '13:00:00', '16:00:00')
  `);
    await connection.query(`
    INSERT INTO transport (bus_date, start_time, leave_time) VALUES
    ('2025-09-01', '08:00:00', '13:00:00'),
    ('2025-09-02', '09:00:00', '15:00:00'),
    ('2025-09-03', '08:00:00', '13:00:00'),
    ('2025-09-04', '12:00:00', '17:00:00')
  `);
    console.log('✅ Database seeded successfully with placement, examcell, transport, tools, and access rules');
    await connection.end();
}
seedDB().catch(console.error);
