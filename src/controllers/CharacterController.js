const { cloudinary } = require("../../config/cloudinary");
const Game = require("../models/Game");

module.exports = {
  // return player
  async show(req, res) {
    const { GM, title } = req.query;
    const user = req.user;

    const game = await Game.findOne({
      GM,
      title,
    });

    const player = game.party.find((value) => value.user === user);

    return res.json(player);
  },

  //atualizar personagem
  async update(req, res) {
    const { title, GM, ...args } = req.body;
    const user = req.user;

    // add avatar url to agrs
    if (req.file) {
      const filePath = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const fileId = [title, GM, user].join("-");

      const uploadedResponse = await cloudinary.v2.uploader.upload(filePath, {
        upload_preset: "essencia_avatars",
        public_id: fileId,
      });

      const avatar = uploadedResponse.secure_url;
      args.avatar = avatar;
    }

    let game;

    await Promise.all(
      Object.entries(args).map(async (arg) => {
        let field = "party.$." + arg[0];

        game = await Game.findOneAndUpdate(
          { title, GM, party: { $elemMatch: { user } } },
          {
            $set: { [field]: arg[1] },
          },
          { new: true }
        );
      })
    );

    return res.json(game);
  },
};
