// React
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Material UI
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'

// MUI Style
import blue from '@material-ui/core/colors/blue'
import blueGrey from '@material-ui/core/colors/blueGrey'
import {
  MuiThemeProvider,
  createMuiTheme,
  withStyles
} from '@material-ui/core/styles'

import Details from './Details'
import Sidebar from './Sidebar'
import TrafficMap from './TrafficMap'

import * as trafficHelper from './helpers/traffic'

const drawerWidth = 400

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: blueGrey
  },
  overrides: {
    MuiButton: {
      text: {
        textTransform: 'inherit'
      }
    }
  }
})

const styles = theme => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  drawerPaper: {
    width: drawerWidth,
    padding: 15
  }
})

class App extends Component {
  state = {
    // screen setup
    info_dialog_open: false,
    // map setup
    fit_bounds: null,
    position: [-2.1, 53.6138],
    zoom: [7],
    pitch: [0],
    bearing: [0],
    distance: 1609,
    current_position: [],
    // data
    authorities: [],
    selected_authority: '',
    selected_year: 2018,
    traffic_points: [],
    traffic_point: {},
    percentages: {}
  }

  componentDidMount = () => {
    this.setState({})
    this.getAuthorities()
  }

  openDetails = traffic_point =>
    this.setState({ info_dialog_open: true, traffic_point: traffic_point })
  closeDetails = () => this.setState({ info_dialog_open: false })

  changeYear = year => {
    this.setState({ selected_year: year })
  }

  changeAuthority = id => {
    this.setState({ selected_authority: id })
  }

  getAverageDailyFlow = () => {
    if (
      this.state.selected_year !== '' &&
      this.state.selected_authority !== ''
    ) {
      trafficHelper.getAnnualAverageDailyFlowByAuthorityAndYear(
        this.state.selected_authority,
        this.state.selected_year,
        data => {
          this.setState({
            traffic_points: data.data,
            fit_bounds: data.bounds,
            percentages: data.percentages
          })
        }
      )
    }
  }

  viewPoint = mapWithEvt => {
    this.openDetails(mapWithEvt.feature.properties)
  }

  getAuthorities = () => {
    trafficHelper.getLocalAuthorities(auths => {
      if (auths.length > 0) {
        this.setState({ authorities: auths })
      }
    })
  }

  render () {
    const { classes } = this.props
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline />
          <nav className={classes.drawer} aria-label='mailbox folders'>
            <Drawer
              classes={{
                paper: classes.drawerPaper
              }}
              variant='permanent'
              open
            >
              <Sidebar
                authorities={this.state.authorities}
                selected_authority={this.state.selected_authority}
                selected_year={this.state.selected_year}
                getAverageDailyFlow={this.getAverageDailyFlow}
                changeYear={this.changeYear}
                changeAuthority={this.changeAuthority}
                traffic_points={this.state.traffic_points}
                percentages={this.state.percentages}
              />
            </Drawer>
          </nav>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <TrafficMap
              bearing={this.state.bearing}
              fit_bounds={this.state.fit_bounds}
              pitch={this.state.pitch}
              position={this.state.position}
              current_position={this.state.current_position}
              zoom={this.state.zoom}
              traffic_points={this.state.traffic_points}
              viewPoint={this.viewPoint}
            />
          </main>
          <Details
            open={this.state.info_dialog_open}
            close={() => this.closeDetails()}
            traffic_point={this.state.traffic_point}
          />
        </div>
      </MuiThemeProvider>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(App)
