import React from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import ValidateWeb3Injector from '../../injectors/ValidateWeb3Injector'
import TokenModel from '../../models/TokenModel'
import TokenCard from '../../components/TokenCard'
import config from '../../config'

class MyPage extends React.Component {
  constructor(props) {
    super(props)

    const { SixPillars } = config.ethereum
    this.state = {
      sixPillars: new this.props.web3.eth.Contract(SixPillars.abi, SixPillars.address),
      tokenModels: [],
    }
  }

  updateTokenId = (remainCount) => {
    if (remainCount <= 0) {
      return null
    }
    const { currentAddress } = this.props
    const { sixPillars } = this.state
    const index = remainCount - 1
    let id, creator
    sixPillars.methods.tokenOfOwnerByIndex(currentAddress, index).call({from: currentAddress})
      .then((result) => {
        id = result
        return sixPillars.methods.creator(id).call({from: currentAddress})
      })
      .then((result) => {
        creator = result
        return sixPillars.methods.inscription(id).call({from: currentAddress})
      })
      .then((result) => {
        const bn = new this.props.web3.utils.BN(result)
        const inscription = ("0000000000000000000000000000000000000000000000000000000000000000" + bn.toString(16)).slice(-64)
        const model = TokenModel.decode(id, currentAddress, creator, inscription)
        this.setState({tokenModels: this.state.tokenModels.concat(model)})
        this.updateTokenId(index)
      })
  }

  handleMintClick = () => {
    const tokenModel = TokenModel.mint()
    const inscription = tokenModel.encode()
    this.props.mintToken && this.props.mintToken(inscription)
  }

  componentDidMount() {
    const { currentAddress } = this.props
    this.state.sixPillars.methods.balanceOf(currentAddress).call({from: currentAddress})
      .then((result) => {
        this.updateTokenId(result)
      })
  }

  render() {
    return (
      <div>
        <h1>My Page</h1>
        <p>
          <Button variant="outlined" onClick={this.handleMintClick}>
            Create BandStar Token
          </Button>
        </p>
        {
          (0 < this.state.tokenModels.length) ? (
            <Grid container>
              {
                this.state.tokenModels.map((tokenModel) => (
                    <Grid item xs={12} sm={6} md={3}>
                      <TokenCard tokenModel={tokenModel} />
                    </Grid>
                ))
              }
            </Grid>
          ) : (
            <p>{"you don't have token."}</p>
          )
        }
      </div>
    )
  }
}

export default ValidateWeb3Injector(MyPage)
