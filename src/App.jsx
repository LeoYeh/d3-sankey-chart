import { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, sankeyCenter } from 'd3-sankey';
import { sankeyCircular, sankeyRight, sankeyLeft, sankeyJustify } from 'd3-sankey-circular';
// import AAA from 'reaviz';
import { Sankey, SankeyNode, SankeyLink, SankeyLabel } from 'reaviz';

// 
import data from './data/index.js';
import './App.css';
import defOption from './option';
import colormap from 'colormap';
// console.log(SankeyNode)

// console.log(sankeyCenter)

function App() {
  
  const [ref, setRef] = useState(null);
  const [option, setOption] = useState(defOption);

  const echart = useMemo(() => ref?.getEchartsInstance(), [ref]);

  const colors = colormap({
    colormap: 'spring',
    nshades: 10,
    format: 'hex',
    alpha: 1
  });
  // console.log('colors ', colors)


  // console.log(JSON.stringify(data))

  function calculateNodeYPosition(nodes, links) {
    
    // 为每个节点计算其源节点的 y 坐标的最大值
    const sourceYs = links.reduce((acc, link) => {
      if (acc[link.target.index] === undefined || acc[link.target.index] < link.source.y1) {
        acc[link.target.index] = link.source.y1;
      }
      return acc;
    }, {});
  
    // 根据源节点的 y 坐标的最大值排序节点
    nodes.sort((a, b) => d3.ascending(sourceYs[a.index], sourceYs[b.index]));
  
    // 为每个节点分配新的 y 坐标，并更新相关链接的位置

    console.log('nodes ', nodes)

    let parentTop = 0;
    nodes.forEach((node, i) => {
      const { y0, y1 } = node;
      Object.assign(node, { width: y1 - y0 })

      const oldY0 = node.y0;
      // const newY0 = i * (nodeWidth + nodePadding);
      const newY0 = oldY0 + node.width + nodePadding;
      const shift = newY0 - oldY0;
  
      // node.y0 = newY0;
      // node.y1 = newY0 + node.width;
      // console.log(y0, y1)

      const { sourceLinks, targetLinks } = node;
      if (sourceLinks.length < 1 && targetLinks.length < 1) node.y0 = -1000;

      // 訂定起始座標
      if (node.index === 0) {
        node.y0 = 0;
        node.y1 = node.y0 + node.width + ((node.sourceLinks.length - 1) * nodePadding);
      }

      const currentNodeWidth = node.width;
      node.targetLinks.forEach((link) => {
        const shift = (currentNodeWidth + nodePadding) + (currentNodeWidth / 2)
        link.y0 = parentTop + (currentNodeWidth / 2);
        link.y1 = link.y0;
        parentTop += currentNodeWidth + nodePadding;
        console.log('top ', link.index, parentTop, currentNodeWidth + nodePadding)
      })
  
      // links.forEach(link => {
      //   if (link.source.index === node.index) {
      //     // link.y0 += shift;
      //     // link.y0 = node.y0;
      //   }
      //   if (link.target.index === node.index) {
      //     // link.y1 += shift;
      //     // link.y1 = node.y0;
      //   }
      //   // link.y0 = 0;
      // });
    });
  }
  
  const nodeWidth = 24;
  const nodePadding = 10;
  const createD3 = () => {
    // const width = window.innerWidth ?? 500;
    const width = 500;
    // const height = screen.height ?? window.innerHeight ?? 500;
    const height = 500;
    const sankeyGenerator = sankey()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .size([width, height])
      // .extent([[1, 1], [width - 1, height - 1]])

    const {nodes, links} = sankeyGenerator(data);
    calculateNodeYPosition(nodes, links);
    // console.log('nodes ', nodes)

    const svg = d3.select("#my_sankey");
    // 假设每个链接都有一个是否展开的标志，默认为false
    links.forEach(link => {
      link.isExpanded = true;
      // link.y0 = 100;
    });

    const stroke = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.1)
      .selectAll("g")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      // .attr("stroke-width", d => d.width);
      .attr("stroke-width", d => d.isExpanded ? Math.max(1, d.width) : 0); // 如果展开则设置宽度，否则设置为0

    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
    
    svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", d => {
        return d.x0;
      })
      .attr("y", d => {
        return d.y0;
      })
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", '#0033cc')
      .attr("rx", 3) // 这里设置圆角的大小
      .attr("ry", 3)
      .on("click", function(e) {
        let d = d3.select(e.currentTarget).datum();
        d.sourceLinks.forEach(link => {
          link.isExpanded = !link.isExpanded; // 点击时切换展开或收起状态
        stroke // 重新设置路径的宽度
          // .filter((l, idx) => {
          //   console.log(l, idx)
          // })
          .filter(l => l === link)
          .transition()
          .duration(1000)
          .attr("stroke-width", link.isExpanded ? Math.max(1, link.width) : 0);
          // .attr("stroke-opacity", link.isExpanded ? 0.1 : 0);
        // check 上層節點
        const upstreamNodes = data.links.filter(link => link.target === d.index)
          .map(link => link.source);
        // console.log('upstreamNodes ', upstreamNodes.isExpanded)
      });
      })
      .on("mouseover", function() {
        d3.select(this)
          .style("fill", "#9B95FF"); // 鼠标滑入时，矩形的颜色会变为#9B95FF
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("fill", "#0033cc"); // 鼠标滑出时，矩形的颜色会变回原来的颜色
      })


  }

  useEffect(() => {
    createD3();
  }, [])

  return (
    <div className="App">
      <svg id="my_sankey"></svg>
      {/*  */}
      {/* <Sankey 
        colorScheme="Spectral" 
        height={500} 
        width={550} 
        nodeWidth={5} 
        justification="left"
        nodePadding={150}
        nodes={
          data.nodes.map((node, i) =>
            <SankeyNode
              key={`node-${i}`} {...node} 
              label={<SankeyLabel position="outside" />} 
              onClick={() => onNodeClick(node.title)} />)} 
              links={ data.links.map((link, i) => 
            <SankeyLink key={`link-${i}`} {...link} />)} /> */}
    </div>
  )
}

export default App
