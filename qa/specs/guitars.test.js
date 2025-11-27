const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require("supertest");
const app = require("../../server");

const expect = chai.expect;
chai.use(chaiHttp);

afterEach(async () => {
  const res = await chai.request(app).post('/admin/refresh');
  expect(res).to.have.status(200);
});

describe("Fender Guitars API", () => {

  describe("GET /guitars", () => {
    it("should return an array of guitars", async () => {
      const res = await request(app).get("/guitars");

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  describe("GET /guitars/:id", () => {
    it("should return a single guitar by id", async () => {
      const res = await request(app).get('/guitars/1');

      expect(res.status).to.equal(200);
      expect(res.body.id).to.equal(1);
      expect(res.body.name).to.equal('American Ultra Luxe Vintage \'60s');
    });

    it("should return 404 for a non-existing guitar", async () => {
      const res = await request(app).get("/guitars/999999");
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });
  });

  describe("POST /guitars", () => {
    it("should create a new guitar with valid data", async () => {
      const newGuitar = {
        name: "Duo-Sonic",
        neck: "Maple",
        neckLength: '25.5"',
        body: "Alder",
        pickups: "Test Pickups",
      };

      const res = await request(app).post("/guitars").send(newGuitar);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body).to.include({
        name: newGuitar.name,
        neck: newGuitar.neck,
        neckLength: newGuitar.neckLength,
        body: newGuitar.body,
        pickups: newGuitar.pickups,
      });
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await request(app).post("/guitars").send({
        name: "Incomplete Guitar",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });
  });

  describe("PUT /guitars/:id", () => {
    it("should update an existing guitar", async () => {
      const updatedFields = {
        pickups: "Updated Test Pickups",
        neckLength: '24.75"',
      };

      const res = await request(app)
        .put('/guitars/1')
        .send(updatedFields);

      expect(res.status).to.equal(200);
      expect(res.body.pickups).to.equal(updatedFields.pickups);
      expect(res.body.neckLength).to.equal(updatedFields.neckLength);
    });

    it("should return 404 when updating non-existing guitar", async () => {
      const res = await request(app)
        .put("/guitars/999999")
        .send({ pickups: "Doesn't matter" });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });
  });

  describe("DELETE /guitars/:id", () => {
    it("should delete a guitar by id", async () => {
      const deleteRes = await request(app).delete('/guitars/1');
      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body).to.have.property("message");
    });

    it("should return 404 when deleting non-existing guitar", async () => {
      const res = await request(app).delete("/guitars/999999");
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });
  });
});
