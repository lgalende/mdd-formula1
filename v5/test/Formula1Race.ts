import { expect } from 'chai'
import hre from 'hardhat'
import { Contract, ZeroAddress } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { Formula1Race, Formula1Driver, Formula1Token } from '../typechain-types'

describe.only('Formula1Race', function () {
  let owner: SignerWithAddress, user1: SignerWithAddress | Contract, user2: SignerWithAddress, user3: SignerWithAddress
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

  beforeEach('deploy attacker', async () => {
    const Attacker = await hre.ethers.getContractFactory('Attacker')
    user1 = await Attacker.deploy(await formula1Race.getAddress())
  })

  beforeEach('mint 10 F1 token to each user', async () => {
      await formula1Token.mint(await user1.getAddress(), { value: 1e15 })
      await formula1Token.mint(user2.address, { value: 1e15 })
      await formula1Token.mint(user2.address, { value: 1e15 })
      await formula1Token.mint(user3.address, { value: 1e15 })
  })

  beforeEach('allow contract', async () => {
    await formula1Token.connect(user2).approve(await formula1Driver.getAddress(), 20e18.toFixed())
    await formula1Token.connect(user3).approve(await formula1Driver.getAddress(), 10e18.toFixed())
  })

  beforeEach('whitelist users', async () => {
    await formula1Driver.connect(owner).whitelistUser(await user1.getAddress())
    await formula1Driver.connect(owner).whitelistUser(user2.address)
    await formula1Driver.connect(owner).whitelistUser(user3.address)
  })

  beforeEach('mint NFTs to each user', async () => {
    await formula1Driver.connect(user2).mint(5)
    await formula1Driver.connect(user2).transfer(await user1.getAddress(), 0)
    await formula1Driver.connect(user2).transfer(await user1.getAddress(), 1)
    await formula1Driver.connect(user2).transfer(await user1.getAddress(), 2)
    await formula1Driver.connect(user2).transfer(await user1.getAddress(), 3)
    await formula1Driver.connect(user2).transfer(await user1.getAddress(), 4)

    await formula1Driver.connect(user2).mint(3)
    await formula1Driver.connect(user3).mint(1)
  })

  describe('race', () => {
    context('when the previous race has finished', () => {
      // TODO: test more cases

      it('sets the winner properly', async () => {
        // TODO: test properly

        console.log('user1: ', await user1.getAddress())
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

  describe('claimPrize', () => {
    const PRIZE = 1e15.toFixed()

    beforeEach('start race', async () => {
      await formula1Race.race()
    })

    beforeEach('fund race contract with ETH', async () => {
      await user2.sendTransaction({ to: await formula1Race.getAddress(), value: 1e16.toFixed() }) // 1e16 = 10 PRIZE
    })

    it('transfers the prize correctly', async () => {
      const winner = await formula1Race.winner()

      console.log('user1: ', await user1.getAddress())
      console.log('user2: ', user2.address)
      console.log('user3: ', user3.address)

      const preContractEthBalance = await ethers.provider.getBalance(await formula1Race.getAddress())
      const preWinnerEthBalance = await ethers.provider.getBalance(winner)

      console.log('preContractEthBalance: ', preContractEthBalance.toString())

      await formula1Race.claimPrize()

      const postContractEthBalance = await ethers.provider.getBalance(await formula1Race.getAddress())
      console.log('postContractEthBalance: ', postContractEthBalance.toString())
      expect(postContractEthBalance).to.be.equal(BigInt(preContractEthBalance) - BigInt(PRIZE))
      
      const postWinnerEthBalance = await ethers.provider.getBalance(winner)
      expect(postWinnerEthBalance).to.be.equal(BigInt(preWinnerEthBalance) + BigInt(PRIZE))
    })
  })
})
