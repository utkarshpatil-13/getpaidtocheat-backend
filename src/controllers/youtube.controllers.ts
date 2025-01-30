import { YoutubeService } from "../services/youtube.services";
import { ApiResponse } from "@utils/apiresponse";
import { ApiError } from "@utils/apierror";
import { asyncHandler } from "@utils/asynchandler";
import { Context } from "hono";

export class YoutubeController {
  private youtubeService: YoutubeService;

  constructor(youtubeService: YoutubeService) {
    this.youtubeService = youtubeService;
  }

  redirectToYouTube = asyncHandler(async (c: Context): Promise<Response> => {
    const authUrl = this.youtubeService.generateAuthUrl();

    if (!authUrl) {
      console.error("Failed to generate YouTube OAuth URL.");
    }

    console.log(authUrl + " - YouTube OAuth URL generated");

    // return c.json(new ApiResponse(201, authUrl, 'OAuth Url generated for YouTube'));
    return c.json({ authUrl });
  });

  handleYouTubeCallback = asyncHandler(async (c: Context) => {
    const code = c.req.query('code');
    const user = c.get('user');
    if (!code) throw new ApiError(400, "Authorization code is missing!");

    // console.log('Youtube controller', code, user);

    const tokens = await this.youtubeService.handleCallback(code, user.id);

    return c.json(new ApiResponse(200, tokens, "YouTube tokens received"));
  });

  uploadContent = asyncHandler(async (c: Context) => {
    const user = c.get('user');

    if (!user) throw new ApiError(401, "User is not authenticated");

    const contentType = c.req.header('content-type');
    console.log(contentType);
    if (contentType && !contentType.includes('multipart/form-data')) {
      throw new ApiError(400, 'Content must be of multipart/form-data');
    }

    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoFile = formData.get('video');

    console.log(title, description);

    console.log(videoFile);

    if (!title) throw new ApiError(400, 'Title is required!');
    if (!description) throw new ApiError(400, 'Description is required!');
    if (!videoFile || !(videoFile instanceof File)) {
      throw new ApiError(400, 'Video file is required');
    }

    // Validate video file type
    if (!videoFile.type.startsWith('video/')) {
      throw new ApiError(400, 'Only video files are allowed');
    }

    // Read file buffer
    const videoBuffer = await videoFile.arrayBuffer();

    // Upload video via service
    const result = await this.youtubeService.uploadContent(
      user.id,
      title,
      description,
      Buffer.from(videoBuffer) || '',
    );

    return c.json(new ApiResponse(200, result));

  });

  getContent = async (c: Context) => {
    const user = c.get('user');
    const { contentId } = c.req.param();

    const metrics = await this.youtubeService.getContent(user.id, contentId);
    return c.json({ success: true, data: metrics });
  };

  getAllContent = asyncHandler(async (c: Context) => {
    const userId = c.req.param('id'); // Get the `id` from request params
    const user = c.get('user'); // Get the user from the context

    console.log('inside get all content');

    if (!user && !userId) {
      throw new ApiError(401, 'User does not exist');
    }

    const idToUse = userId || user?.id; // Use the `id` from params if available; otherwise, use the user ID from context

    if (!idToUse) {
      throw new ApiError(400, 'User ID is required');
    }

    console.log(idToUse);

    const allContent = await this.youtubeService.getAllContent(idToUse);

    return c.json(new ApiResponse(201, allContent, 'All content of user!'));
  });

}
