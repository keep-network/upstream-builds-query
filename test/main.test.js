import { expect } from "chai"
import { execute } from "../src/main.js"

describe("main", function () {
  const upstreamBuildsString = `[
    {
      "module": "github.com/keep-network/keep-core/solidity",
      "ref": "",
      "version": "1.2.3-rc.0+feature.123asd",
      "url": ""
    },
    {
      "module": "github.com/keep-network/keep-core",
      "ref": "",
      "version": "b454cc275c8d3d0e609639cd85244a099fa8ee69",
      "url": "   "
    },
    {
      "module": "github.com/keep-network/keep-ecdsa",
      "ref": "",
      "version": "v0.1",
      "url": ""
    },
    {
      "module": "github.com/keep-network/keep-ecdsa",
      "ref": "",
      "version": "v0.2",
      "url": ""
    }
  ]`

  describe("execute", () => {
    it("finds value for single query", async () => {
      const queriesString =
        "keep-core-contracts-version = github.com/keep-network/keep-core/solidity#version"

      const expectedResult = {
        "keep-core-contracts-version": "1.2.3-rc.0+feature.123asd",
      }

      const result = execute(upstreamBuildsString, queriesString)

      expect(result).deep.equal(expectedResult)
    })

    it("finds values for multiple queries", async () => {
      const queriesString = [
        "keep-core-contracts-version = github.com/keep-network/keep-core/solidity#version",
        "keep-core-version = github.com/keep-network/keep-core#version",
      ]

      const expectedResult = {
        "keep-core-contracts-version": "1.2.3-rc.0+feature.123asd",
        "keep-core-version": "b454cc275c8d3d0e609639cd85244a099fa8ee69",
      }

      const result = execute(upstreamBuildsString, queriesString)

      expect(result).deep.equal(expectedResult)
    })

    it("finds the latest entry in case of duplicates", async () => {
      const queriesString =
        "keep-ecdsa-version = github.com/keep-network/keep-ecdsa#version"

      const expectedResult = {
        "keep-ecdsa-version": "v0.2",
      }

      const result = execute(upstreamBuildsString, queriesString)

      expect(result).deep.equal(expectedResult)
    })

    describe("when failOnEmpty is true", async () => {
      const failOnEmpty = true

      it("fails on empty string", async () => {
        const queriesString =
          "keep-core-solidity-url = github.com/keep-network/keep-core#url"

        expect(() =>
          execute(upstreamBuildsString, queriesString, failOnEmpty)
        ).to.throw(
          Error,
          "value is empty for module [github.com/keep-network/keep-core] and property [url]"
        )
      })

      it("fails on whitespace-only value", async () => {
        const queriesString =
          "keep-core-solidity-url = github.com/keep-network/keep-core/solidity#url"

        expect(() =>
          execute(upstreamBuildsString, queriesString, failOnEmpty)
        ).to.throw(
          Error,
          "value is empty for module [github.com/keep-network/keep-core/solidity] and property [url]"
        )
      })

      it("fails on missing property", async () => {
        const queriesString =
          "keep-core-missing-property = github.com/keep-network/keep-core#missing-property"

        expect(() =>
          execute(upstreamBuildsString, queriesString, failOnEmpty)
        ).to.throw(
          Error,
          "property [missing-property] not found for module [github.com/keep-network/keep-core]"
        )
      })
    })

    describe("when failOnEmpty is false", async () => {
      const failOnEmpty = false

      it("returns empty value", async () => {
        const queriesString =
          "keep-core-solidity-url = github.com/keep-network/keep-core/solidity#url"

        const expectedResult = {
          "keep-core-solidity-url": "",
        }

        const result = execute(upstreamBuildsString, queriesString, failOnEmpty)

        expect(result).deep.equal(expectedResult)
      })

      it("returns whitespace-only value", async () => {
        const queriesString =
          "keep-core-url = github.com/keep-network/keep-core#url"

        const expectedResult = {
          "keep-core-url": "   ",
        }

        const result = execute(upstreamBuildsString, queriesString, failOnEmpty)

        expect(result).deep.equal(expectedResult)
      })

      it("fails on missing property", async () => {
        const queriesString =
          "keep-core-missing-property = github.com/keep-network/keep-core#missing-property"

        expect(() =>
          execute(upstreamBuildsString, queriesString, failOnEmpty)
        ).to.throw(
          Error,
          "property [missing-property] not found for module [github.com/keep-network/keep-core]"
        )
      })
    })
  })
})
