import React from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import './example-styles.css';
import hri_data from './data/my_hri.json';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class ToolBoxItem extends React.Component {
  render() {
    return (
      <div
        className="toolbox__items__item"
        onClick={this.props.onTakeItem.bind(undefined, this.props.item)}
      >
        {this.props.item.i}
      </div>
    );
  }
}
class ToolBox extends React.Component {
  render() {
    return (
      <div className="toolbox">
        <span className="toolbox__title">High Risk Issues</span>
        <div className="toolbox__items">
          {this.props.items.map(item => (
            <ToolBoxItem
              key={item.i}
              item={item}
              onTakeItem={this.props.onTakeItem}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default class ToolboxLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    initialLayout: generateLayout()
  };

  state = {
    currentBreakpoint: "lg",
    compactType: null,
    mounted: false,
    layouts: { lg: this.props.initialLayout },
    toolbox: { lg: [] }
  };

  componentDidMount() {
    this.setState({ mounted: true });
    hriInit(this);
  }

  generateDOM() {
    return _.map(this.state.layouts[this.state.currentBreakpoint], l => {
      return (
        <div key={l.i} className={l.static ? "static" : ""}>
          <div className="hide-button" onClick={this.onPutItem.bind(this, l)}>
            &times;
          </div>
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              Static - {l.i}
            </span>
          ) : (
            <span className="text">{l.i} - {hri_data[l.i].TrustedAdvisorCheckName}</span>
          )}
        </div>
      );
    });
  }

  onBreakpointChange = breakpoint => {
    this.setState(prevState => ({
      currentBreakpoint: breakpoint,
      toolbox: {
        ...prevState.toolbox,
        [breakpoint]:
          prevState.toolbox[breakpoint] ||
          prevState.toolbox[prevState.currentBreakpoint] ||
          []
      }
    }));
  };

  onTakeItem = item => {
    this.setState(prevState => ({
      toolbox: {
        ...prevState.toolbox,
        [prevState.currentBreakpoint]: prevState.toolbox[
          prevState.currentBreakpoint
        ].filter(({ i }) => i !== item.i)
      },
      layouts: {
        ...prevState.layouts,
        [prevState.currentBreakpoint]: [
          ...prevState.layouts[prevState.currentBreakpoint],
          item
        ]
      }
    }));
  };

  onPutItem = item => {
    this.setState(prevState => {
      return {
        toolbox: {
          ...prevState.toolbox,
          [prevState.currentBreakpoint]: [
            ...(prevState.toolbox[prevState.currentBreakpoint] || []),
            item
          ]
        },
        layouts: {
          ...prevState.layouts,
          [prevState.currentBreakpoint]: prevState.layouts[
            prevState.currentBreakpoint
          ].filter(({ i }) => i !== item.i)
        }
      };
    });
  };

  onNewHriInit = () => {
    this.setState(prevState => {
        return {
          toolbox: {
            ...prevState.layouts,
            [prevState.currentBreakpoint]: [
              ...(prevState.layouts[prevState.currentBreakpoint] || [])
            ]
          },
          layouts: {
            ...prevState.toolbox,
            [prevState.currentBreakpoint]: prevState.toolbox[
              prevState.currentBreakpoint
            ]
          }
        };
      });
  };

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
    this.setState({ layouts });
  };

  render() {
    return (
      <div>        
        <button onClick={this.onNewHriInit}>Init HRI</button>
        <ToolBox
          items={this.state.toolbox[this.state.currentBreakpoint] || []}
          onTakeItem={this.onTakeItem}
        />
        <div className="verticalLine"></div>
        <hr width="100%" color="orange" className="horizontalLine"></hr>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={false}
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType} clp removed this
          preventCollision={!this.state.compactType}
          allowOverlap={true}
        >
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

function hriInit(myState) {
    myState.setState(prevState => {
        return {
          toolbox: {
            ...prevState.layouts,
            [prevState.currentBreakpoint]: [
              ...(prevState.layouts[prevState.currentBreakpoint] || [])
            ]
          },
          layouts: {
            ...prevState.toolbox,
            [prevState.currentBreakpoint]: prevState.toolbox[
              prevState.currentBreakpoint
            ]
          }
        };
      });
    return
}

function generateLayout() {
    let hri_length = hri_data.length;
    return _.map(_.range(0, hri_length), function(item, i) {
        return {
        x: 5,
        y: 9,
        w: 2,
        h: 3,
        i: i.toString(),
        static: false
        };
    });
}

