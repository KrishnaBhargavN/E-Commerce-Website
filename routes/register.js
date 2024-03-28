const express = require('express')
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcryptjs'); 

router.post('/signUp', (req, res) => {
    console.log(req.body);
    const studentName = req.body.studentName;
    const studentID = req.body.studentId;
    const email = req.body.email;
    const password = req.body.password;
    const contact = req.body.contact;
    const gender = req.body.gender;
    const room = req.body.room;
    const wing = req.body.wing;
    const floor = req.body.floor;
    const buildingName = req.body.buildingName;

    const emailQuery = `SELECT * FROM student WHERE email = "${email}"`;

    connection.query(emailQuery, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).send('Error fetching data');
        }

        if (results.length !== 0) {
            return res.status(401).json({ status: 'Account already exists' });
        } 

        // Proceed with inserting data if email is not already registered
        const insertQueryLogin = `INSERT INTO authorization (email, passcode) VALUES (?, ?)`;
        const insertParamsLogin = [email, password];

        connection.query(insertQueryLogin, insertParamsLogin, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).send('Error inserting data');
            }

            const insertQueryRoom = `INSERT INTO room (building_name, floor_no, wing, room_number) VALUES (?, ?, ?, ?)`;
            const insertParamsRoom = [buildingName, floor, wing, room];

            connection.query(insertQueryRoom, insertParamsRoom, (err, results) => {
                if (err) {
                    console.error('Error inserting data in Room Table:', err);
                    return res.status(500).send('Error inserting data');
                }

                const selectQueryRoomID = `SELECT room_id FROM room WHERE building_name = ? AND floor_no = ? AND wing = ? AND room_number = ?`;
                const selectParamsRoomID = [buildingName, floor, wing, room];

                connection.query(selectQueryRoomID, selectParamsRoomID, (err, results) => {
                    if (err) {
                        console.error('Error fetching data:', err);
                        return res.status(500).send('Error fetching data');
                    }

                    const roomID = results[0].room_id;
                    const insertQueryStudent = `INSERT INTO student (name, email, contact_number, room_id, gender, student_id) VALUES (?, ?, ?, ?, ?, ?)`;
                    const insertParamsStudent = [studentName, email, contact, roomID, gender, studentID];

                    connection.query(insertQueryStudent, insertParamsStudent, (err, results) => {
                        if (err) {
                            console.error('Error inserting data:', err);
                            return res.status(500).send('Error inserting data');
                        }

                        res.status(200).json({ status: 'Account created' });
                    });
                });
            });
        });
    });

    console.log("Everything worked")
});


router.post('/addPersonToAvailableRooms', (req, res) => {
  const {addToAvailableRooms } = req.body;
  const email = req.session.user['email'];
  console.log(email);
    connection.query(
      'SELECT * FROM STUDENT WHERE EMAIL = ?',
      [email],
      (error, studentRow) => {
        if (error) {
          console.error('Error executing SELECT query:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (studentRow.length === 0) {
          return res.status(404).json({ error: 'Student not found.' });
        }

        if (addToAvailableRooms !== true) {
          return res.status(400).json({ error: 'Invalid addToAvailableRooms value.' });
        }

        const { ROOM_ID, STUDENT_ID } = studentRow[0];
        connection.query(
          'INSERT INTO AVAILABLE_ROOM (ROOM_ID, STUDENT_ID, ROOM_STATUS, Description) VALUES (?, ?, ?, ?)',
          [ROOM_ID, STUDENT_ID, 'Y', null],
          (insertError, result) => {

            if (insertError) {
              console.error('Error executing INSERT query:', insertError);
              return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(201).json({ message: 'Your request for room swap has been accepted !!', result });
          }
        );
      }
    );
  });


  router.get('/checkStudentInAvailableRooms', (req, res) => {
    const email = req.session.user['email'];
    console.log(email);
  
      connection.query(
        'SELECT * FROM AVAILABLE_ROOM WHERE STUDENT_ID = (SELECT STUDENT_ID FROM STUDENT WHERE EMAIL = ?)',
        [email],
        (error, result) => {
  
          if (error) {
            console.error('Error executing SELECT query:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          if (result.length > 0) {
            res.status(200).json({ message: 'yes', result });
          } else {
            res.status(404).json({ message: 'not found' });
          }
        }
      );
    });
 




module.exports = router;