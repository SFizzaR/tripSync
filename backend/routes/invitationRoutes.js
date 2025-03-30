const express = require('express')
const { SendInvitation, acceptInvite, rejectInvite, cancelInvite } = require('../controller/invitationController')
const { protect } = require('../middleware/errorHandler');
router = express.Router()

router.post('/', protect, SendInvitation);
router.put('/accept/:inviteId', protect, acceptInvite);
router.put('/reject/:inviteId', protect, rejectInvite);
router.delete('/cancel/:inviteId', protect, cancelInvite);

module.exports = router;
