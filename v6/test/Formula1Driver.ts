import { expect } from 'chai'
import hre from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { Formula1Driver, Formula1Token } from '../typechain-types'

describe('Formula1Driver', function () {
  let owner: SignerWithAddress, user: SignerWithAddress
  let formula1Token: Formula1Token, formula1Driver: Formula1Driver

  before('setup', async () => {
    // eslint-disable-next-line prettier/prettier
    [owner, user] = await hre.ethers.getSigners()
  })

  beforeEach('deploy ERC20 token', async () => {
    const Formula1Token = await hre.ethers.getContractFactory('Formula1Token')
    formula1Token = await Formula1Token.deploy(owner.address)
  })

  beforeEach('deploy ERC721 token', async () => {
    const Formula1Driver = await hre.ethers.getContractFactory('Formula1Driver')
    formula1Driver = await Formula1Driver.deploy(owner.address, await formula1Token.getAddress())
  })

  describe('initialization', () => {
    it('sets the name properly', async () => {
      expect(await formula1Driver.name()).to.equal('Formula1Driver')
    })

    it('sets the symbol properly', async () => {
      expect(await formula1Driver.symbol()).to.equal('FAST')
    })

    it('sets the f1 token properly', async () => {
        expect(await formula1Driver.f1Token()).to.equal(await formula1Token.getAddress())
    })
  })

  describe('mint', () => {
    beforeEach('mint 10 F1 token to the user', async () => {
        await formula1Token.mint(user.address, { value: 1e15 })
    })

    context('when the user is whitelisted', () => {
      beforeEach('whitelist user', async () => {
        await formula1Driver.connect(owner).whitelistUser(user.address)
      })

      context('when the user has minted less than 5 NF tokens', () => {
        // TODO: test mint quantity cases

        beforeEach('allow contract', async () => {
          await formula1Token.connect(user).approve(await formula1Driver.getAddress(), 10e18.toFixed())
        })

        it('mints the NFTs to the user', async () => {
          const quantity = 5

          await formula1Driver.connect(user).mint(quantity)
        })
      })

      context('when the user has already minted 5 NF tokens', () => {
        it('reverts', async () => {
          // TODO
        })
      })
    })

    context('when the user is not whitelisted', () => {
      it('reverts', async () => {
        await expect(formula1Driver.connect(user).mint(1)).to.be.revertedWith('user not whitelisted')
      })
    })
  })
})
