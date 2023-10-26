import React from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import {copyToClipboard, replaceHtmlTags} from './utils/utilities';
import Button from '@cloudscape-design/components/button';
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import Tabs from "@cloudscape-design/components/tabs";
import Badge from "@cloudscape-design/components/badge";
import Modal from "@cloudscape-design/components/modal";
import Link from "@cloudscape-design/components/link";
import Box from "@cloudscape-design/components/box";
import Table from "@cloudscape-design/components/table";
import '@cloudscape-design/global-styles/index.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import './example-styles.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

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

    return (
      <div>
        <Button variant="inline-link" onClick={this.handleOpenModal}>More details</Button>
        <Modal
            size={'max'}
            expandToFit={true}
            header={this.props.data.TrustedAdvisorCheckName}
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button iconName="copy" variant="normal" onClick={() => copyToClipboard(JSON.stringify(this.props.data, undefined, 4))}>Copy</Button>
                </SpaceBetween>
              </Box>
            }
            visible={this.state.showModal}
            onDismiss={this.handleCloseModal}
        >
                <Table 
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      cell: (item) => item.TrustedAdvisorCheckName || "-"
                    },
                    {
                      id: "description",
                      header: "Description",
                      cell: (item) => <span>{replaceHtmlTags(item.TrustedAdvisorCheckDesc)}</span> || "-"
                    },
                    {
                      id: "bestPractice",
                      header: "Best Practice",
                      cell: (item) => (
                        <Link external href={bp_url}>{item.WABestPracticeTitle || "-"}</Link>
                      )
                    },
                    {
                      id: "pillar",
                      header: "Pillar",
                      cell: (item) => item.WAPillarId || "-"
                    },
                    {
                      id: "businessRisk",
                      header: "Business Risk",
                      cell: (item) => item.WABestPracticeRisk || "-"
                    },
                    {
                      id: "resource",
                      header: "Resource at Risk",
                      cell: (item) => JSON.stringify(item.FlaggedResources, null, 4) || "-"
                    },
                  ]}
                  items={[this.props.data]}
                  loadingText="Loading data"
                  sortingDisabled
                  wrapLines
                  empty={
                    <Box
                      margin={{ vertical: "xs" }}
                      textAlign="center"
                      color="inherit"
                    >
                      <SpaceBetween size="m">
                        <b>No data</b>
                      </SpaceBetween>
                    </Box>
                  }
                />
        </Modal>
      </div>
    );
  }
}

class ToolBoxItem extends React.Component {
  render() {
    return (
      // <div className="toolbox__items__item">
        <Button iconName="add-plus" variant="normal" onClick={this.props.onTakeItem.bind(undefined, this.props.item)}>
          {parseInt(this.props.item.i) + 1} - {this.props.hriData[this.props.item.i].TrustedAdvisorCheckName}
        </Button>
      // </div>
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
    hriData: null,
    activeTab: 'highUrgency'
  };

  componentDidMount() {
    this.setState({ mounted: true });
    hriInit(this);
  }

  generateDOM() {
    return _.map(this.state.layouts[this.state.currentBreakpoint], l => {
      return (
        <div key={l.i}>
          <Container
            disableContentPaddings
            disableHeaderPaddings
            header={
              <Header
                variant="h3"
              >
                {parseInt(l.i) + 1} - {this.state.hriData[l.i].TrustedAdvisorCheckName}<HriDetails data={this.state.hriData[l.i]}/>
              </Header>
            }
          >
            <Button variant="normal" onClick={this.onPutItem.bind(this, l)}>Close</Button>
          </Container>
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
      hriData: null
    });
  }

  expandFlaggedResources = (hriData) => {
    let expandedHriData = [];
    for (let i = 0; i < hriData.length; i++) {
      for (let n = 0; n < hriData[i].FlaggedResources.length; n++) {
        let tmpHriObject = JSON.parse(JSON.stringify(hriData[i]))
        tmpHriObject.FlaggedResources = hriData[i].FlaggedResources[n]
        expandedHriData.push(tmpHriObject);
      }
    }
    return expandedHriData
  }

  uploadFile = (event) => {
    let file = event.target.files[0];
    this.resetLayout();
    
    if (file) {
      let fileReader = new FileReader(); 
      fileReader.readAsText(file); 
      fileReader.onload = () => {
        let expandedHriData = this.expandFlaggedResources(JSON.parse(fileReader.result));
        let layout = generateLayout(true, expandedHriData);
        this.setState({
          layouts: { lg: layout },
          hriData: expandedHriData
        });
        hriInit(this);
      }; 
      fileReader.onerror = () => {
        console.log(fileReader.error);
      }; 
    }
  }

  renderToolBoxItems = (items) => {
    return (items.map(item => (
      <ToolBoxItem
        key={item.i}
        item={item}
        onTakeItem={this.onTakeItem}
        hriData={this.state.hriData}
      />
    )))
  }

  getHighUrgencyItems = (items) => {
    let highUrgencyItems = [];
    for (let i = 0; i < items.length; i++) {
      if (this.state.hriData[items[i].i].FlaggedResources.status === 'error') {
        highUrgencyItems.push(items[i]);
      }
    }
    return highUrgencyItems
  }

  getMediumUrgencyItems = (items) => {
    let mediumUrgencyItems = [];
    for (let i = 0; i < items.length; i++) {
      if (this.state.hriData[items[i].i].FlaggedResources.status === 'warning') {
        mediumUrgencyItems.push(items[i]);
      }
    }
    return mediumUrgencyItems
  }

  getLowUrgencyItems = (items) => {
    let lowUrgencyItems = [];
    for (let i = 0; i < items.length; i++) {
      if (this.state.hriData[items[i].i].FlaggedResources.status === 'ok') {
        lowUrgencyItems.push(items[i]);
      }
    }
    return lowUrgencyItems
  }

  render() {
    let highUrgencyItems = this.getHighUrgencyItems(this.state.toolbox[this.state.currentBreakpoint] || []);
    let mediumUrgencyItems = this.getMediumUrgencyItems(this.state.toolbox[this.state.currentBreakpoint] || []);
    let lowUrgencyItems = this.getLowUrgencyItems(this.state.toolbox[this.state.currentBreakpoint] || []);
    return (
      <div>
        <Container
          fitHeight={true}
          disableContentPaddings
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween
                  direction="horizontal"
                  size="xs"
                >
                  <Button iconName={"upload"}>
                    <input className="inputButton hidden" type={"file"} accept={".json"} onChange={this.uploadFile} />
                    Upload json file
                  </Button>
                </SpaceBetween>
              }
            >
              Trusted Advisor Checks
            </Header>
          }
        >
          <Tabs
            tabs={[
              {
                  label: <div>High Urgency <Badge color="red">{highUrgencyItems.length}</Badge></div>,
                  id: 'highUrgency',
                  content: <div className="toolbox"><SpaceBetween direction="horizontal" size="xxxs">{this.renderToolBoxItems(highUrgencyItems)}</SpaceBetween></div>
              },
              {
                label: <div>Medium Urgency <Badge color="grey">{mediumUrgencyItems.length}</Badge></div>,
                id: 'mediumUrgency',
                content: <div className="toolbox"><SpaceBetween direction="horizontal" size="xxxs">{this.renderToolBoxItems(mediumUrgencyItems)}</SpaceBetween></div>
              },
              {
                label: <div>Low Urgency <Badge color="green">{lowUrgencyItems.length}</Badge></div>,
                id: 'lowUrgency',
                content: <div className="toolbox"><SpaceBetween direction="horizontal" size="xxxs">{this.renderToolBoxItems(lowUrgencyItems)}</SpaceBetween></div>
              }
            ]}
            activeTabId={this.state.activeTab}
            onChange={(e) => {
              const newTab = e.detail.activeTabId;
              this.setState({ activeTab: newTab });
            }}
          />
        </Container>
        
        <div className="yAxisTop">High Impact</div>
        <div className="yAxisBottom">Low Impact</div>
        <div className="xAxisLeft">High Urgency</div>
        <div className="xAxisRight">Low Urgency</div>
        <div className="verticalLine"></div>
        <hr width="100%" color="black" className="horizontalLine"></hr>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={false}
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType}
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

function generateLayout(uploaded=false,hriData=null) {
    if (uploaded === false) {
        return [];
    } else {
      let hri_length = hriData.length;
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

