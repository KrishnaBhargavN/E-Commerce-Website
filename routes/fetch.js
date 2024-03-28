const express = require('express')
const emailNotification = require('../emailNotification');
const router = express.Router();
const connection = require('../database');
const subject = "Your Room Swap Request has been accepted"
roomResult = []
router.get('/', (req, res) => {
    const user = req.session.user;
    const email = user['email'];

    let filterQuery = `
        SELECT  
            STUDENT.STUDENT_ID, 
            STUDENT.NAME, 
            STUDENT.EMAIL, 
            STUDENT.CONTACT_NUMBER, 
            STUDENT.GENDER, 
            ROOM.BUILDING_NAME, 
            ROOM.FLOOR_NO, 
            ROOM.ROOM_ID,
            ROOM.WING, 
            ROOM.ROOM_NUMBER
        FROM 
            ROOM 
        INNER JOIN 
            STUDENT ON ROOM.ROOM_ID = STUDENT.ROOM_ID 
        INNER JOIN 
            AVAILABLE_ROOM ON ROOM.ROOM_ID = AVAILABLE_ROOM.ROOM_ID 
        WHERE 
            STUDENT.GENDER = (SELECT GENDER FROM STUDENT WHERE EMAIL = ?) AND 
            STUDENT.EMAIL <> ? AND
            AVAILABLE_ROOM.ROOM_STATUS = 'Y'`;

    let filterParams = [email,email];

    if (req.body.building_name) {
        filterQuery += ' AND ROOM.BUILDING_NAME = ?';
        filterParams.push(req.body.building_name);
    }

    if (req.body.floor) {
        filterQuery += ' AND ROOM.FLOOR_NO = ?';
        filterParams.push(req.body.floor);
    }

    if (req.body.wing) {
        filterQuery += ' AND ROOM.WING = ?';
        filterParams.push(req.body.wing);
    }

    connection.query(filterQuery, filterParams, (err, filteredRoomResult) => {
        if (err) {
            console.error('Error fetching filtered room data:', err);
            res.status(500).send('Error fetching filtered room data');
            return;
        }

        res.status(200).json(filteredRoomResult);
    });
});


router.post('/', (req, res) => {
    console.log(req.body);
    const user = req.session.user;
    const email = user['email'];

    let filterQuery = `
        SELECT  
            STUDENT.STUDENT_ID, 
            STUDENT.NAME, 
            STUDENT.EMAIL, 
            STUDENT.CONTACT_NUMBER, 
            STUDENT.GENDER, 
            ROOM.BUILDING_NAME, 
            ROOM.FLOOR_NO, 
            ROOM.ROOM_ID,
            ROOM.WING, 
            ROOM.ROOM_NUMBER
        FROM 
            ROOM 
        INNER JOIN 
            STUDENT ON ROOM.ROOM_ID = STUDENT.ROOM_ID 
        INNER JOIN 
            AVAILABLE_ROOM ON ROOM.ROOM_ID = AVAILABLE_ROOM.ROOM_ID 
        WHERE 
            STUDENT.GENDER = (SELECT GENDER FROM STUDENT WHERE EMAIL = ?) AND 
            STUDENT.EMAIL <> ? AND
            AVAILABLE_ROOM.ROOM_STATUS = 'Y'`;

    let filterParams = [email,email];

    if (req.body.building_name) {
        filterQuery += ' AND ROOM.BUILDING_NAME = ?';
        filterParams.push(req.body.building_name);
    }

    if (req.body.floor) {
        filterQuery += ' AND ROOM.FLOOR_NO = ?';
        filterParams.push(req.body.floor);
    }

    if (req.body.wing) {
        filterQuery += ' AND ROOM.WING = ?';
        filterParams.push(req.body.wing);
    }

    connection.query(filterQuery, filterParams, (err, filteredRoomResult) => {
        if (err) {
            console.error('Error fetching filtered room data:', err);
            res.status(500).send('Error fetching filtered room data');
            return;
        }

        
        const filteredData = filteredRoomResult.filter(item => {
            console.log('Item EMAIL:', item['EMAIL']);
            console.log('Email to exclude:', email);
            return item['EMAIL'] !== email;
        });
        res.status(200).json(filteredData);
    });
});

router.get('/countSwapRequests', (req, res) => {
    const REQ_STUDENT_EMAIL = req.session.user['email'];

    connection.query(
        'SELECT COUNT(*) AS swapRequestsCount FROM SWAP_REQUEST WHERE REQ_TO_STUDENT_ID = (SELECT STUDENT_ID FROM STUDENT WHERE EMAIL = ?) AND CONFIRM_AVAILABILITY = "PENDING" ',
        [REQ_STUDENT_EMAIL],
        (error, result) => {
            if (error) {
                console.error('Error fetching swap requests count:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'No swap requests found' });
            }

            const swapRequestsCount = result[0].swapRequestsCount;
            res.status(200).json({ count: swapRequestsCount });
        }
    );
});


router.get('/swapRequests',(req,res)=>{
    const email=req.session.user['email'];
    const query = `
    SELECT 
        SR.REQUEST_ID,
        S.NAME  ,
        S.EMAIL ,
        S.CONTACT_NUMBER ,
        S.GENDER ,
        S.ROOM_ID ,
        R.BUILDING_NAME ,
        R.FLOOR_NO ,
        R.WING ,
        R.ROOM_NUMBER 
    FROM 
        SWAP_REQUEST SR
    INNER JOIN 
        STUDENT S ON SR.REQ_STUDENT_ID = S.STUDENT_ID
    INNER JOIN 
        ROOM R ON S.ROOM_ID = R.ROOM_ID
    WHERE 
        SR.REQ_TO_STUDENT_ID = (SELECT STUDENT_ID FROM STUDENT WHERE EMAIL = ?)
        AND SR.CONFIRM_AVAILABILITY = 'PENDING'`;

    connection.query(query,[email],(err,results)=>{
        if(err){
            console.error('Error fetching swap requests:',err);
            res.status(500).send('Error fetching swap requests');
            return;
        }
        res.status(200).json(results);
    });
}
);

router.post('/acceptSwapRequest',(req,res)=>{
    const swapRequestId=req.body.requestId;
    
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

            const query6 = `delete from SWAP_REQUEST WHERE REQ_TO_STUDENT_ID = ?`
            connection.query(query6,[reqToStudentId],(err,results)=>{
                if(err){
                    return connection.rollback(()=>{
                        console.error('Error deleting rooms:',err);
                        res.status(500).send('Error accepting swap request');
                    }
                    );
                }
            });

            
            const query7 = `select * from ROOM R join STUDENT S where R.ROOM_ID = S.ROOM_ID AND R.ROOM_ID = ? `
            
            connection.query(query7,[reqToRoomId],(err,results)=>{
                if(err){
                    return connection.rollback(()=>{
                        console.error('Error deleting rooms:',err);
                        res.status(500).send('Error accepting swap request');
                    }
                    );
                }
                roomResult = results[0];
                emailNotification.sendEmail(subject,JSON.stringify(roomResult));
            });
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

router.post('/rejectSwapRequest',(req,res)=>{
    const swapRequestId=req.body['requestId'];
    const subject = "Your Room Swap Request for the following Room has been Rejected";
    const query=`UPDATE SWAP_REQUEST SET CONFIRM_AVAILABILITY = 'REJECTED' WHERE REQUEST_ID = ?`;
    const query2 = `select * from ROOM R where R.ROOM_ID = (select REQ_TO_ROOM_ID from    SWAP_REQUEST where REQUEST_ID = ?)`
    connection.query(query, [swapRequestId], (err, results) => {
        if (err) {
          // Handle error from the first query
          console.error('Error executing query:', err);
          res.status(500).send('Error rejecting swap request');
          return;
        }
      
        connection.query(query2, [swapRequestId], (err, results2) => {
          if (err) {
            console.error('Error executing query2:', err);
            res.status(500).send('Error rejecting swap request');
            return;
          }
          
          emailNotification.sendEmail(subject, JSON.stringify(results2[0]));
          res.status(200).send('Swap Request rejected');
        });
      
    });
      
}
);

module.exports = router;