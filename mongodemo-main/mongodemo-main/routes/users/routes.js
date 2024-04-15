const express = require('express');
const router = express.Router();
const User = require('../../dblayer/user');
const { Error } = require('mongoose');
const GenerateResponse = require('../../utils/response_creator');

// HTTP get method to get list of users, this function would get invoked at /users/ API call 
router.get('/', async (req, res) => {
    const users = await getUsers();
    res.json(new GenerateResponse(true, undefined, users));
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json(new GenerateResponse(false, "User not found"));
        }
        res.json(new GenerateResponse(true, undefined, user));
    } catch (error) {
        res.status(500).json(new GenerateResponse(false, error.message));
    }
});

router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { name, email, phone }, { new: true });
        if (!user) {
            return res.status(404).json(new GenerateResponse(false, "User not found"));
        }
        const users = await getUsers();
        res.json(new GenerateResponse(true, undefined, users));
    } catch (error) {
        res.status(500).json(new GenerateResponse(false, error.message));
    }
});

router.post('/', async (req, res) => {
    const { name, email, phone } = req.body; // Extracting name, email, and phone from request body

    try {
        const user = await User.create({ name, email, phone }); // Creating new user with provided fields
        const users = await getUsers();
        res.json(new GenerateResponse(true, undefined, users));
    } catch (error) {
        if (error instanceof Error) {
            res.json(new GenerateResponse(false, error.message));
        } else {
            res.json(new GenerateResponse(false, error));
        }
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const delResult = await User.deleteOne({ _id: req.params.id });
        if(delResult.hasOwnProperty("deletedCount") && delResult.deletedCount === 1){
            const users = await getUsers();
            res.json(new GenerateResponse(true, undefined, users));   
        } else {
            res.json(new GenerateResponse(false, "Unable to delete user at the moment."));
        }
    } catch (error) {
        if (error instanceof Error) {
            res.json(new GenerateResponse(false, error.message));
        } else {
            res.json(new GenerateResponse(false, error));
        }
    }
});

async function getUsers(){
    const users = await User.find({}).lean();
    return users instanceof Array ? users : [];
}

module.exports = router;
