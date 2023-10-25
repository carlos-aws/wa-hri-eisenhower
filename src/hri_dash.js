import React from "react";
import ReactModal from 'react-modal';
import Table from 'rc-table';
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import {copyToClipboard, replaceHtmlTags} from './utils/utilities';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import './example-styles.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);
ReactModal.setAppElement('#root');

class HriDetails extends React.Component {
  constructor () {
    super();
    this.state = {
      showModal: false
    };
    
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }
  
  handleOpenModal () {
    this.setState({ showModal: true });
  }
  
  handleCloseModal () {
    this.setState({ showModal: false });
  }
  
  render () {
    const bp_url = 'https://docs.aws.amazon.com/wellarchitected/latest/framework/' + this.props.data.WABestPracticeId + '.html'
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 100,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: 300,
        render: () => <span>{replaceHtmlTags(this.props.data.TrustedAdvisorCheckDesc)}</span>,
      },
      {
        title: 'Best Practice',
        dataIndex: 'bestPractice',
        key: 'bestPractice',
        width: 150,
        render: () => <a href={bp_url} target="_blank">{this.props.data.WABestPracticeTitle}</a>,
      },
      {
        title: 'Pillar',
        dataIndex: 'pillar',
        key: 'pillar',
        width: 100,
      },
      {
        title: 'Business Risk',
        dataIndex: 'businessRisk',
        key: 'businessRisk',
        width: 100,
      },
      {
        title: 'Resources at Risk',
        dataIndex: 'resources',
        key: 'resources',
        width: 300,
      },
    ];

    const data = [
      { name: this.props.data.TrustedAdvisorCheckName,
        description: this.props.data.TrustedAdvisorCheckDesc,
        bestPractice: this.props.data.WABestPracticeTitle,
        pillar: this.props.data.WAPillarId,
        businessRisk: this.props.data.WABestPracticeRisk,
        resources: JSON.stringify(this.props.data.FlaggedResources, null, 4),
        key: '1' 
      },
    ];

    return (
      <div>
        <button style={{marginTop: 10 + 'px'}} onClick={this.handleOpenModal}>More details..</button>
        <ReactModal 
           isOpen={this.state.showModal}
           contentLabel="HRI Details Modal"
           style={{
              overlay: {
                backgroundColor: 'aliceblue'
              },
              content: {
                color: 'black'
              }
            }}
        >
          <span>
            <button style={{marginRight: 10 + 'px'}} onClick={this.handleCloseModal}>Close</button>
            <button onClick={() => copyToClipboard(JSON.stringify(this.props.data, undefined, 4))}>Copy</button>
          </span>
          <Table columns={columns} data={data} className="styled-table"/>
        </ReactModal>
      </div>
    );
  }
}

class ToolBoxItem extends React.Component {
  render() {
    return (
      <div
        className="toolbox__items__item"
        onClick={this.props.onTakeItem.bind(undefined, this.props.item)}
      >
        {parseInt(this.props.item.i) + 1} - {this.props.hri_data[this.props.item.i].WAPillarId}
        <span class="toolbox__items__item_tooltip">{this.props.hri_data[this.props.item.i].TrustedAdvisorCheckName}</span>
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
              hri_data={this.props.hri_data}
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
    toolbox: { lg: [] },
    hri_data: null
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
            <span className="text">{parseInt(l.i) + 1} - {this.state.hri_data[l.i].TrustedAdvisorCheckName}<HriDetails data={this.state.hri_data[l.i]}/></span>
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

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
    this.setState({ layouts });
  };

  resetLayout = () => {
    this.setState({
      layouts: { lg: [] },
      toolbox: { lg: [] },
      hri_data: null
    });
  }

  uploadFile = (event) => {
    let file = event.target.files[0];
    this.resetLayout();
    
    if (file) {
      let fileReader = new FileReader(); 
      fileReader.readAsText(file); 
      fileReader.onload = () => {
        let layout = generateLayout(true, JSON.parse(fileReader.result));
        this.setState({
          layouts: { lg: layout },
          hri_data: JSON.parse(fileReader.result)
        });
        hriInit(this);
      }; 
      fileReader.onerror = () => {
        console.log(fileReader.error);
      }; 
    }
  }

  render() {
    const props = 1;
    return (
      <div>
        <span>Upload HRI json file <input type="file" name="myFile" onChange={this.uploadFile} /></span>
        <ToolBox
          items={this.state.toolbox[this.state.currentBreakpoint] || []}
          onTakeItem={this.onTakeItem}
          hri_data={this.state.hri_data}
        />
        <div className="yAxisTop">Low Complexity</div>
        <div className="yAxisBottom">High Complexity</div>
        <div className="xAxisLeft">Low Impact</div>
        <div className="xAxisRight">High Impact</div>
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

function hriInit(currentState) {
    currentState.setState(prevState => {
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

function generateLayout(uploaded=false,hri_data=null) {
    if (uploaded === false) {
        return [];
    } else {
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
}

