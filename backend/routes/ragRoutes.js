const express = require("express");
const router = express.Router();

const {
  askFromDocuments,
  retrieveOnly,
} = require("../controllers/ragController");

router.post("/ask", askFromDocuments);
router.post("/retrieve", retrieveOnly);

module.exports = router;