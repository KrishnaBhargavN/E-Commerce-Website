const express = require('express')
const router = express.Router();
const connection = require('../database');


router.post('/sendRequestToStudent', (req, res) => {
    const REQ_STUDENT_EMAIL = req.session.user['email'];
    const REQ_TO_STUDENT  = req.body;
    console.log(REQ_TO_STUDENT);
    connection.query(
      'SELECT * FROM STUDENT WHERE EMAIL = ?',
      [REQ_STUDENT_EMAIL],
      (error, requestingStudentRows) => {
        if (error) {
          console.error('Error fetching requesting student:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        if (requestingStudentRows.length === 0) {
          return res.status(404).json({ error: 'Requesting student not found' });
        }
  
        const requestingStudent = requestingStudentRows[0];
  
        connection.query(
          'INSERT INTO SWAP_REQUEST (REQ_STUDENT_ID, REQ_TO_STUDENT_ID, REQ_ROOM_ID, REQ_TO_ROOM_ID, CONFIRM_AVAILABILITY) VALUES (?, ?, ?, ?, ?)',
          [requestingStudent.STUDENT_ID, REQ_TO_STUDENT['STUDENT_ID'], requestingStudent.ROOM_ID, REQ_TO_STUDENT['ROOM_ID'], 'Pending'],
          (error) => {
            if (error) {
              console.error('Error inserting swap request:', error);
              return res.status(500).json({ error: 'Internal server error' });
            }
  
            res.status(200).json({ message: 'Room swap request sent successfully.' });
          }
        );
      }
    );
});
  

router.post('/checkSwapRequestIsValid', (req, res) => {
    const REQ_STUDENT_EMAIL = req.session.user['email'];
    const REQ_TO_STUDENT = req.body;

    connection.query(
        'SELECT * FROM STUDENT WHERE EMAIL = ?',
        [REQ_STUDENT_EMAIL],
        (error, requestingStudentRows) => {
            if (error) {
                console.error('Error fetching requesting student:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (requestingStudentRows.length === 0) {
                return res.status(404).json({ error: 'Requesting student not found' });
            }

            const requestingStudent = requestingStudentRows[0];

            connection.query(
                'SELECT * FROM SWAP_REQUEST WHERE REQ_STUDENT_ID = ? AND REQ_TO_STUDENT_ID = ?',
                [requestingStudent.STUDENT_ID, REQ_TO_STUDENT['STUDENT_ID']],
                (queryError, existingRequests) => {
                    if (queryError) {
                        console.error('Error checking swap request:', queryError);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    if (existingRequests.length > 0) {
                        return res.status(200).json({ exists: true, message: 'Swap request already exists' });
                    } else {
                        return res.status(200).json({ exists: false, message: 'Swap request does not exist' });
                    }
                }
            );
        }
    );
});

  router.post('/accept',(req,res)=>{
    const swapRequestId=req.body.swapRequestId;
    
    connection.beginTransaction((err)=>{
        if(err){
            console.error('Error beginning transaction:',err);
            res.status(500).send('Error rejecting swap request');
            return;
        }
        const query1=`UPDATE SWAP_REQUEST SET CONFIRM_AVAILABILITY = 'ACCEPTED' WHERE REQUEST_ID = ?`;
        connection.query(query1,[swapRequestId],(err,results)=>{
            if(err){
                return connection.rollback(()=>{
                    console.error('Error accepting swap request:',err);
                    res.status(500).send('Error accepting swap request');
                }
                );
            }
        }
        );
        const query2=`SELECT REQ_STUDENT_ID, REQ_TO_STUDENT_ID, REQ_ROOM_ID, REQ_TO_ROOM_ID FROM SWAP_REQUEST WHERE REQUEST_ID = ?`;
        connection.query(query2,[swapRequestId],(err,results)=>{
            if(err){
                return connection.rollback(()=>{
                    console.error('Error fetching swap request:',err);
                    res.status(500).send('Error accepting swap request');
                }
                );
            }
            const reqStudentId=results[0].REQ_STUDENT_ID;
            const reqToStudentId=results[0].REQ_TO_STUDENT_ID;
            const reqRoomId=results[0].REQ_ROOM_ID;
            const reqToRoomId=results[0].REQ_TO_ROOM_ID;
            const query3=`UPDATE STUDENT SET ROOM_ID = ? WHERE STUDENT_ID = ?`;
            connection.query(query3,[reqToRoomId,reqStudentId],(err,results)=>{
                if(err){
                    return connection.rollback(()=>{
                        console.error('Error updating student room:',err);
                        res.status(500).send('Error accepting swap request');
                    }
                    );
                }
            }
            );
            const query4=`UPDATE STUDENT SET ROOM_ID = ? WHERE STUDENT_ID = ?`;
            connection.query(query4,[reqRoomId,reqToStudentId],(err,results)=>{
                if(err){
                    return connection.rollback(()=>{
                        console.error('Error updating student room:',err);
                        res.status(500).send('Error accepting swap request');
                    }
                    );
                }
            }
            );
            const query5=`DELETE FROM AVAILABLE_ROOM WHERE ROOM_ID IN (?,?)`;
            connection.query(query5,[reqRoomId,reqToRoomId],(err,results)=>{
                if(err){
                    return connection.rollback(()=>{
                        console.error('Error deleting rooms:',err);
                        res.status(500).send('Error accepting swap request');
                    }
                    );
                }
            }
            );
        }
        );
        connection.commit((err)=>{
            if(err){
                return connection.rollback(()=>{
                    console.error('Error committing transaction:',err);
                    res.status(500).send('Error accepting swap request');
                }
                );
            }
            res.status(200).send('Swap request accepted');
        }
        );
    }
    );
}
);
  
  

module.exports = router;