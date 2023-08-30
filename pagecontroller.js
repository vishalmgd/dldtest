/////// puppeteer logic working fine in local but giving blob url at production

const axios = require("axios");

const puppeteer = require("puppeteer");

const showhomepage = async (req, res) => {
  res.render("index", {
    downloadUrl: "",
  });
};


const downloadVideo = async (req, res) => {
    try {
      const url = req.body.videoUrl;
      console.log("Getting URL from EJS page:", url);
  
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
      });
  
      const filename = "video.mp4";
  
      res
        .status(200)
        .set("Content-Type", "video/mp4")
        .set("Content-Disposition", "attachment; filename=" + filename);
  
      response.data.pipe(res);
    } catch (error) {
      console.log(`Error: ${error}`);
      res.status(500).send(error);
    }
  };

const twitterpost = async (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.status(400).json({ error: "Please provide a valid URL!" });
  }

  try {
    const getVideoUrl = async (tweetUrl) => {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      });

      const page = await browser.newPage();

      try {

        ///one way

        await page.goto(instagramUrl, { waitUntil: "domcontentloaded" })
        console.log("Navigation done. Page loaded")
        await page.waitForSelector("video", { timeout: 90000*2 });
        console.log("Video tag found")
        const tweetData = await page.evaluate(() => {
          const videoElement = document.querySelector("video");
          console.log("Inside fn",videoElement);
          return {
            videoUrl: videoElement.src,
          };
        });
          console.log(tweetData.videoUrl",tweetData.videoUrl)
        return tweetData.videoUrl;

        // second way

        // await page.goto(tweetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        // const videoElementHandle = await page.waitForSelector("video", { timeout: 60000 });
        // if (!videoElementHandle) {
        //   throw new Error("Video element not found");
        // }
        // const videoUrl = await page.evaluate((videoElement) => {
        //   return videoElement.src;
        // }, videoElementHandle);

        // return videoUrl;
        ////////////////////////////

      } catch (error) {
        console.error("Error:", error);
      } finally {
        await browser.close();
      }
    };

    const videoUrl = await getVideoUrl(url);

    if (videoUrl) {
      // Instead of saving the file, send the video URL to the client
      console.log("Outside fn",videoUrl);
      res.render("index", { downloadUrl: videoUrl });
  } else {
      res.status(404).json({ error: "Video URL not found." });
  }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

module.exports = { showhomepage, twitterpost,downloadVideo };






////////////////////////////////////////////////


// // /////////////////// puppeteer logic to find media resource tye and network request interception/////////////////////////

// const axios = require("axios");
// const puppeteer = require("puppeteer");
// const path = require("path"); // Make sure you have path module imported
// const fs = require("fs");
// const { chromium } = require("playwright");

// const showhomepage = async (req, res) => {
//   res.render("index", {
//     downloadUrl: "",
//   });
// };

// /////  This approach not working at production but working in local machine


// // const getDirectVideoUrl = async (instagramUrl) => {
// //   const browser = await puppeteer.launch({ headless: true });
// //   const page = await browser.newPage();

// //   // Enable request interception
// //   await page.setRequestInterception(true);

// //   // Set up an event listener for handling errors
// //   page.on("error", (error) => {
// //     console.error("Error:", error);
// //     browser.close();
// //   });

// //   // Set up an event listener for capturing media requests
// // const videoUrlPromise = new Promise((resolve, reject) => {
// //   page.on("request", (request) => {
// //     if (request.resourceType() === "media") {
// //       console.log("Media request intercepted:", request.url());
// //       browser.close();
// //       resolve(request.url());
// //     } else {
// //       console.log("Non-media request intercepted:", request.url());
// //       // Only continue non-media requests
// //       if (!request.resourceType() || request.resourceType() !== "document") {
// //         request.continue();
// //       }
// //     }
// //   });
// // });


// //   // Navigate to the URL
// //   try {
// //     await page.goto(instagramUrl, { waitUntil: "domcontentloaded" });
// //   } catch (error) {
// //     console.error("Navigation Error:", error);
// //     browser.close();
// //     throw error; // Throw the error to be caught by the caller
// //   }

// //   // Wait for the promise to resolve
// //   const videoUrl = await videoUrlPromise;

// //   return videoUrl;
// // };

// //////// This apprach working local checking for production 

// // //// This approach is working at local checking for production for insta and its slow////

// // const getDirectVideoUrl = async (instagramUrl) => {
// //   const browser = await puppeteer.launch({ headless: true });
// //   const page = await browser.newPage();

// //   // Enable request interception
// //   await page.setRequestInterception(true);
// //   console.log("1. request interception done ")

// //   // Create a promise that resolves when the video URL is found
// //   const videoUrlPromise = new Promise((resolve, reject) => {
// //     console.log("2. just entered inside promise  ")
// //     page.on("request", (request) => {
// //       if (request.resourceType() === "media") {
// //         console.log("5. media url found  ")
// //         console.log("Media request intercepted:", request.url());
// //         browser.close();
// //         resolve(request.url());
// //       } else {
// //         console.log("6. media url not found. Again request done  ")
// //         console.log("7. media url not found.this url found ",request.url())
// //         request.continue();
// //       }
// //     });

// //     ///// reload the page for stories
// //     // Keep track of whether the video URL has been resolved

// //     page.on("error", (error) => {
// //       console.error("Error:", error);
// //       browser.close();
// //       reject(error);
// //     });

// //     // Navigate to the URL
// //     console.log("3. just before page navigation  ")
// //     page
// //       .goto(instagramUrl, { waitUntil: "domcontentloaded" })
// //       .catch((error) => {
// //         reject(error);
// //       });
// //     console.log("4. After page navigation  ")
// //   });

// //   // Wait for the promise to resolve
// //   const videoUrl = await videoUrlPromise;

// //   return videoUrl;
// // };


// //  //  some wait for condition

// // const getDirectVideoUrl = async (instagramUrl) => {
// //   const browser = await puppeteer.launch({ headless: true });
// //   const page = await browser.newPage();

// //   // Enable request interception
// //   await page.setRequestInterception(true);
// //   console.log("1. Request interception enabled");

// //   // Create a promise that resolves when the video URL is found
// //   const videoUrlPromise = new Promise(async (resolve, reject) => {
// //     console.log("2. Just entered inside promise");

// //     // Wait for network requests to settle down
// //     page.on('response', async (response) => {
// //       if (response.url().startsWith('https://www.instagram.com')) {
// //         console.log("Response received from:", response.url());
// //         const responseEnd = response.finished();
// //         if (responseEnd) {
// //           console.log("Network requests settled down");
// //           page.off('response');
          
// //           // Now you can proceed with request interception logic
// //           page.on("request", (request) => {
// //             if (request.resourceType() === "media") {
// //               console.log("Media request intercepted:", request.url());
// //               browser.close();
// //               resolve(request.url());
// //             } else {
// //               request.continue();
// //             }
// //           });
// //         }
// //       }
// //     });

// //     // Handle errors
// //     page.on("error", (error) => {
// //       console.error("Error:", error);
// //       browser.close();
// //       reject(error);
// //     });

// //     // Navigate to the URL
// //     console.log("3. Just before page navigation");
// //     try {
// //       await page.goto(instagramUrl, { waitUntil: "domcontentloaded", timeout: 90000 });

// //     } catch (error) {
// //       console.error("Navigation Error:", error);
// //       browser.close();
// //       reject(error);
// //     }
// //     console.log("4. After page navigation");
// //   });

// //   // Wait for the promise to resolve
// //   const videoUrl = await videoUrlPromise;

// //   return videoUrl;
// // };
// // // // // // 

// const getDirectVideoUrl = async (instagramUrl) => {
//   const browser = await chromium.launch({ headless: true });
//   const page = await browser.newPage();

//   try {
//     const responsePromise = new Promise((resolve) => {
//       page.on("response", async (response) => {
//         if (response.request().resourceType() === "media") {
//           resolve(response);
//         }
//       });
//     });

//     console.log("Navigating to:", instagramUrl);
//     await page.goto(instagramUrl, { waitUntil: "domcontentloaded" });

//     const response = await responsePromise;

//     if (response.ok()) {
//       console.log("Media Response received from:", response.url());

//       // Your logic to extract the media URL from the response
//       const mediaUrl = response.url();
//       return mediaUrl;
//     } else {
//       throw new Error(`Response not OK: ${response.url()}`);
//     }
//   } catch (error) {
//     console.error("Error during scraping:", error);
//     await browser.close();
//     throw error;
//   } finally {
//     await browser.close();
//   }
// };

// const downloadVideo = async (req, res) => {
//   try {
//     const url = req.body.videoUrl;
//     console.log("u r getting url from ejs page", url);

//     const response = await axios({
//       method: "GET",
//       url: url,
//       responseType: "stream",
//     });

//     const filename = "insta.mp4";
//     // console.log(`this item isin handlesubmit if block ext check ${urlstr}`);
//     // console.log("======================================================");
//     res
//       .status(200)
//       .set("Content-Type", "video/mp4")
//       .set("Content-Disposition", "attachment; filename=" + filename);

//     response.data.pipe(res);
//   } catch (error) {
//     console.log(`Error: ${error}`);
//     res.status(500).send(error);
//   }
// };

// const twitterpost = async (req, res) => {
//   const url = req.body.url;

//   if (!url) {
//     return res.status(400).json({ error: "Please provide a valid URL!" });
//   }

//   try {
//     const instagramUrl = url;
//     const videoUrl = await getDirectVideoUrl(instagramUrl); // Await the function call
//     console.log("just before if else condition", videoUrl);

//     if (videoUrl) {
//       // Download the video using Axios
//       // const downloadedVideoPath = await downloadVideo(videoUrl);

//       // Render the response to the client with the downloaded video path
//       res.render("index", { downloadUrl: videoUrl });
//     } else {
//       res.status(404).json({ error: "Video URL not found." });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: err });
//   }
// };

// module.exports = { showhomepage, twitterpost, downloadVideo };
