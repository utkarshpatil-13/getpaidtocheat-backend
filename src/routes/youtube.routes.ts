import { Hono } from "hono";
import { YoutubeController } from "../controllers/youtube.controllers";
import { YoutubeService } from "../services/youtube.services";
import { YoutubeRepository } from "../repositories/youtube.repositories";
import { OAuthClient } from "../utils/youtube.utils";
import { verifyUser } from "@controllers/auth.controllers";
import { SocialMediaAccountService } from "@services/socialmediaaccount.services";

const router = new Hono();

const oauthClient = new OAuthClient();
const socialMediaService = new SocialMediaAccountService();
const youtubeRepository = new YoutubeRepository(oauthClient);
const youtubeService = new YoutubeService(youtubeRepository, socialMediaService);
const youtubeController = new YoutubeController(youtubeService);

// youtube auth
router.get("/auth", verifyUser, youtubeController.redirectToYouTube);
router.get("/callback", verifyUser, youtubeController.handleYouTubeCallback);

// content upload and engagement mertics
router.post('/upload', verifyUser, youtubeController.uploadContent);
router.get('/:contentId', verifyUser, youtubeController.getContent);
router.get('/', verifyUser, youtubeController.getAllContent);
router.get('/userid/:id?', youtubeController.getAllContent);

export default router;
