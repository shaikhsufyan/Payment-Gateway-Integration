const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());

const sha256 = require("sha256");
const uniqid = require("uniqid");

const PORT = 8000;

const HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;
const merchantTransactionId = uniqid();
const userId = 123;

app.post("/pay", async (req, res) => {
  try {
    let { name, number, amount } = req.body;

    const END_POINT = "/pg/v1/pay";

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100,
      name: name,
      redirectUrl: `http://localhost:8000/status?id=${merchantTransactionId}`,
      redirectMode: "POST",
      // callbackUrl: "https://webhook.site/callback-url",
      mobileNumber: number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base63EncodedPayload = bufferObj.toString("base64");
    const xVerify =
      sha256(base63EncodedPayload + END_POINT + SALT_KEY) + "###" + SALT_INDEX;

    const options = {
      method: "POST",
      url: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      data: {
        request: base63EncodedPayload,
      },
    };

    await axios(options)
      .then((response) => {
        console.log(response.data.data.instrumentResponse.redirectInfo.url);
        return res.json(response.data);
      })
      .catch((err) => {
        console.log(err);
      });

    app.post("/status", async (req, res) => {
      const merchantTransactionId = req.query.id;
      console.log(merchantTransactionId);
      
      const merchantId = MERCHANT_ID;
      if (merchantTransactionId) {
        // SHA256(“/pg/v1/status/{merchantId}/{merchantTransactionId}” + saltKey) + “###” + saltIndex
        const xVerify =
          sha256(
            `/pg/v1/status/${merchantId}/${merchantTransactionId}` + SALT_KEY
          ) +
          "###" +
          SALT_INDEX;

        const options = {
          method: "GET",
          url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-MERCHANT-ID": merchantId,
            // SHA256(“/pg/v1/status/{merchantId}/{merchantTransactionId}” + saltKey) + “###” + saltIndex
            "X-VERIFY": xVerify,
          },
        };

        axios
          .request(options)
          .then((response) => {
            if (response.data.success === true) {
              let url = "succes";
              res.redirect(url);
            } else {
              let url = "Error";
              res.redirect(url);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  } catch (err) {
    console.log(err);
  }

  //   const END_POINT = "/pg/v1/pay";

  //   const payload = {
  //     merchantId: MERCHANT_ID,
  //     merchantTransactionId: merchantTransactionId,
  //     merchantUserId: userId,
  //     amount: amount,
  //     name:name,
  //     redirectUrl: `http://localhost:8000/redirect-url/${merchantTransactionId}`,
  //     redirectMode: "post",
  //     // callbackUrl: "https://webhook.site/callback-url",
  //     mobileNumber: number,
  //     paymentInstrument: {
  //       type: "PAY_PAGE",
  //     },
  //   };

  //   //   SHA256(Base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index
  //   const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  //   const base63EncodedPayload = bufferObj.toString("base64");
  //   const xVerify = sha256(base63EncodedPayload + END_POINT + SALT_KEY) + "###" + SALT_INDEX;

  //   const options = {
  //     method: "post",
  //     url: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
  //     headers: {
  //       accept: "application/json",
  //       "Content-Type": "application/json",
  //       "X-VERIFY": xVerify,
  //     },
  //     data: {
  //       request: base63EncodedPayload,
  //     },
  //   };
  //   axios
  //     .request(options)
  //     .then(function (response) {
  //       console.log(response.data);
  //       const url = response.data.data.instrumentResponse.redirectInfo.url;
  //       //   res.send(url)
  //       res.redirect(url);
  //     })
  //     .catch(function (error) {
  //       console.error("ERROR SERVER : ",error);
  //     });
  // });

  // app.get("/redirect-url/:merchantTransactionId", (req, res) => {
  //   const { merchantTransactionId } = req.params;
  //   console.log("merchantTransactionId : ", merchantTransactionId);
  //   if (merchantTransactionId) {
  //      // SHA256(“/pg/v1/status/{merchantId}/{merchantTransactionId}” + saltKey) + “###” + saltIndex
  //      const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`+ SALT_KEY) + "###" + SALT_INDEX
  //     const options = {
  //       method: "get",
  //       url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
  //       headers: {
  //         accept: "application/json",
  //         "Content-Type": "application/json",
  //         "X-MERCHANT-ID":merchantTransactionId,
  //         // SHA256(“/pg/v1/status/{merchantId}/{merchantTransactionId}” + saltKey) + “###” + saltIndex
  //         "X-VERIFY": xVerify
  //       },
  //     };
  //     axios
  //       .request(options)
  //       .then(function (response) {
  //         console.log(response.data);
  //        res.send(response.data);
  //        if(response.data.code === "PAYMENT_SUCCESS"){
  //         // redirect Frontend Success Page
  //         console.log(response.data.code);

  //         res.redirect("http://localhost:3000/")

  //        }else if(response.data.code === "PAYMENT_ERROR"){
  //         // redirect to Frotend Error Page

  //        }

  //       })
  //       .catch(function (error) {
  //         console.error(error);
  //       });
  //     // res.send({ merchantTransactionId });
  //   } else {
  //     console.log(error, "ERROR");
  //   }
});

// app.post("/client", (req, res) => {
//   console.log(req.body);

//   let data = {
//     name: req.body.name,
//     number: req.body.number,
//     amount: req.body.amount,
//   };
//   res.status(200).send(data);
//   console.log(data);
// });

app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

app.listen(PORT, (req, res) => {
  console.log("server running on PORT :", PORT);
});
