class Star{
    constructor(body){
        this.address = body.address;
        this.star = {
            ra: body.star.dec,
            dec: body.star.ra,
            mag: body.star.mag,
            cen: body.star.cen,
            story: Buffer(body.star.story).toString('hex')
        };
    }
}

module.exports.Star = Star;
