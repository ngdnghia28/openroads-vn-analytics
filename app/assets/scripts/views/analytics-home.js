'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { fetchAdminSubregions, fetchAdminStats, fetchTofixTasks } from '../actions/action-creators';
import PageHeader from '../components/page-header';
import AAList from '../components/aa-list';
import AAStats from '../components/aa-stats';
import AAExtendedStats from '../components/aa-extended-stats';
import AAMap from '../components/aa-map';
import AATofixTasks from '../components/aa-tofix-tasks';

var Analytics = React.createClass({
  displayName: 'Analytics',

  propTypes: {
    children: React.PropTypes.object,
    _fetchAdminSubregions: React.PropTypes.func,
    _fetchAdminStats: React.PropTypes.func,
    _fetchTofixTasks: React.PropTypes.func,
    subregions: React.PropTypes.object,
    stats: React.PropTypes.object,
    tofixtasks: React.PropTypes.object
  },

  componentDidMount: function () {
    this.props._fetchAdminSubregions();
    this.props._fetchAdminStats();
    this.props._fetchTofixTasks();
  },

  render: function () {
    return (
      <section className='page'>
        <PageHeader
          pageTitle='Philippines' />

        <div className='page__body aa'>
          <div className='aa-main'>
            <AAMap />

            <AAStats
              adminAreas={this.props.subregions.adminAreas} />

            <div className='inner'>
              <div className='col--main'>
                <AAExtendedStats
                  fetched={this.props.stats.fetched}
                  fetching={this.props.stats.fetching}
                  stats={this.props.stats}/>

                <AATofixTasks
                  fetched={this.props.tofixtasks.fetched}
                  fetching={this.props.tofixtasks.fetching}
                  adminAreaName='Philippines'
                  meta={this.props.tofixtasks.data.tasks.meta}
                  tasks={this.props.tofixtasks.data.tasks.results}/>
              </div>

              <div className='col--sec'>
                <AAList
                  adminAreas={this.props.subregions.adminAreas}
                  sliceList />
              </div>
            </div>

          </div>
        </div>
      </section>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    subregions: state.adminSubregions,
    stats: state.stats,
    tofixtasks: state.tofixtasks
  };
}

function dispatcher (dispatch) {
  return {
    _fetchAdminSubregions: () => dispatch(fetchAdminSubregions()),
    _fetchAdminStats: () => dispatch(fetchAdminStats()),
    _fetchTofixTasks: () => dispatch(fetchTofixTasks())
  };
}

module.exports = connect(selector, dispatcher)(Analytics);
