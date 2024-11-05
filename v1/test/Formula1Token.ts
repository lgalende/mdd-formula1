import { expect } from 'chai'
import hre from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { Formula1Token } from '../typechain-types'

describe('Formula1Token', function () {
  let owner: SignerWithAddress, user: SignerWithAddress, formula1Token: Formula1Token

  before('setup', async () => {
    // eslint-disable-next-line prettier/prettier
    [owner, user] = await hre.ethers.getSigners()
    const Formula1Token = await hre.ethers.getContractFactory('Formula1Token')
    formula1Token = await Formula1Token.deploy()
  })

  describe('initialization', () => {
    it('sets the name properly', async () => {
      expect(await formula1Token.name()).to.equal('Formula1')
    })

    it('sets the symbol properly', async () => {
      expect(await formula1Token.symbol()).to.equal('F1')
    })
  })

  describe('mint', () => {
    context('when the user sends the proper amount of ETH', () => {
      it('transfers the tokens to the user', async () => {
        const preUserBalance = await formula1Token.balanceOf(user.address)
        const preContractBalance = await ethers.provider.getBalance(await formula1Token.getAddress())

        await formula1Token.mint(user.address, { value: 1e15 })

        const amount = await formula1Token.MINT_AMOUNT() // 10 tokens
        const postUserBalance = await formula1Token.balanceOf(user.address)
        expect(postUserBalance).to.equal(preUserBalance + amount)
        
        const postContractBalance = await ethers.provider.getBalance(await formula1Token.getAddress())
        expect(postContractBalance).to.equal(preContractBalance + 1e15.toFixed())
      })
    })

    context('when the user does not send the proper amount of ETH', () => {
      it('reverts', async () => {
        await expect(formula1Token.mint(user.address, { value: 1e14 })).to.be.revertedWith('invalid ether amount')
      })
    })
  })

  describe('withdraw', () => {
    beforeEach('send ETH to the contract', async () => {
      // it is already created with some balance though
      await formula1Token.mint(user.address, { value: 1e15 })
      await formula1Token.mint(user.address, { value: 1e15 })
      await formula1Token.mint(user.address, { value: 1e15 })
    })

    context('when the sender is the owner', () => {
      it('transfers the ETH to the recipient', async () => {
        const preUserBalance = await ethers.provider.getBalance(user.address)
        const preContractBalance = await ethers.provider.getBalance(await formula1Token.getAddress())

        await formula1Token.connect(owner).withdraw(user.address)

        const postUserBalance = await ethers.provider.getBalance(user.address)
        expect(postUserBalance).to.equal(preUserBalance + preContractBalance)
        
        const postContractBalance = await ethers.provider.getBalance(await formula1Token.getAddress())
        expect(postContractBalance).to.equal(0)
      })
    })

    context('when the sender is not the owner', () => {
      it('reverts', async () => {
        await expect(formula1Token.connect(user).withdraw(user.address)).to.be.revertedWith('unauthorized')
      })
    })
  })
})
