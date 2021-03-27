let getHomepage = (req,res) => {
  return res.render("homepage.ejs");
};

let getFacebookUserProfile = (req,res) =>{
  return res.render("profile.ejs");
}

module.exports = {
  getHomepage: getHomepage,
  getFacebookUserProfile: getFacebookUserProfile
};