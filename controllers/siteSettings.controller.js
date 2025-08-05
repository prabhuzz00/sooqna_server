import SiteSetting from "../models/SiteSetting.js";

export const getSiteSetting = async (req, res) => {
  try {
    const siteSetting = await SiteSetting.findOne();
    res.status(200).json({ success: true, data: siteSetting });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch site settings" });
  }
};

export const updateSiteSetting = async (req, res) => {
  try {
    const {
      siteTitle,
      email,
      contactNo,
      facebook,
      instagram,
      twitter,
      linkedin,
      popularProductHeadingEn,
      popularProductHeadingAr,
    } = req.body;

    const data = {
      siteTitle,
      email,
      contactNo,
      facebook,
      instagram,
      twitter,
      linkedin,
      popularProductHeadingEn,
      popularProductHeadingAr,
    };

    let siteSetting = await SiteSetting.findOne();

    if (siteSetting) {
      Object.assign(siteSetting, data);
    } else {
      siteSetting = new SiteSetting(data);
    }

    await siteSetting.save();
    res.status(200).json({ success: true, data: siteSetting });
  } catch (error) {
    console.error("Error updating site setting:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
