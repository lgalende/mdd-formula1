import { expect } from 'chai'
import hre from 'hardhat'
import { Contract, ZeroAddress } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { Formula1Race, Formula1Driver, Formula1Token } from '../typechain-types'

describe('Formula1Race', function () {
  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress
  let formula1Token: Formula1Token, formula1Driver: Formula1Driver, formula1Race: Formula1Race

  before('setup', async () => {
    // eslint-disable-next-line prettier/prettier
    [owner, user1, user2, user3] = await hre.ethers.getSigners()
  })

  beforeEach('deploy ERC20 token', async () => {
    const Formula1Token = await hre.ethers.getContractFactory('Formula1Token')
    formula1Token = await Formula1Token.deploy(owner.address)
  })

  beforeEach('deploy ERC721 token', async () => {
    const Formula1Driver = await hre.ethers.getContractFactory('Formula1Driver')
    formula1Driver = await Formula1Driver.deploy(owner.address, await formula1Token.getAddress())
  })

  beforeEach('deploy F1 race', async () => {
    const Formula1Race = await hre.ethers.getContractFactory('Formula1Race')
    formula1Race = await Formula1Race.deploy(await formula1Driver.getAddress())
  })

  describe('initialization', () => {
    it('sets the f1 NFT reference properly', async () => {
        expect(await formula1Race.f1Driver()).to.equal(await formula1Driver.getAddress())
    })
  })

  describe('race', () => {
    beforeEach('mint 10 F1 token to each user', async () => {
        await formula1Token.mint(user1.address, { value: 1e15 })
        await formula1Token.mint(user2.address, { value: 1e15 })
        await formula1Token.mint(user3.address, { value: 1e15 })
    })

    beforeEach('allow contract', async () => {
      await formula1Token.connect(user1).approve(await formula1Driver.getAddress(), 10e18.toFixed())
      await formula1Token.connect(user2).approve(await formula1Driver.getAddress(), 10e18.toFixed())
      await formula1Token.connect(user3).approve(await formula1Driver.getAddress(), 10e18.toFixed())
    })

    beforeEach('whitelist users', async () => {
      await formula1Driver.connect(owner).whitelistUser(user1.address)
      await formula1Driver.connect(owner).whitelistUser(user2.address)
      await formula1Driver.connect(owner).whitelistUser(user3.address)
    })

    beforeEach('mint NFTs to each user', async () => {
      await formula1Driver.connect(user1).mint(5)
      await formula1Driver.connect(user2).mint(3)
      await formula1Driver.connect(user3).mint(1)
    })

    context('when the previous race has finished', () => {
      // TODO: test more cases

      it('sets the winner properly', async () => {
        // TODO: test properly

        console.log('user1: ', user1.address)
        console.log('user2: ', user2.address)
        console.log('user3: ', user3.address)

        const preWinner = await formula1Race.winner()
        expect(preWinner).to.equal(ZeroAddress)

        await formula1Race.race()

        const postWinner = await formula1Race.winner()
        expect(postWinner).to.not.equal(ZeroAddress)

        const winnerNftBalance = await formula1Driver.balanceOf(postWinner)
        expect(winnerNftBalance).to.be.greaterThan(0)
      })
    })

    context('when the previous race has not finished', () => {
      it('reverts', async () => {
        // TODO
      })
    })
  })
})
