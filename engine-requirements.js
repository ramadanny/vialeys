parseInt(process.versions.node.split('.')[0],10)<20&&(
  console.error(
    [`❌ Node.js 20+ Required!`,`You are using Node.js ${process.versions.node}.`,`Please upgrade to Node.js 20+ to proceed.`]
      .map(l=>' '.repeat(Math.floor(((process.stdout.columns||80)-l.length)/2))+
        l.split('').map((c,i,a)=>`\x1b[38;2;${Math.round(180+(255-180)*(i/(a.length-1||1)))};${Math.round(0+(50-0)*(i/(a.length-1||1)))};0m${c}`).join('')+'\x1b[0m'
      ).join('\n')+'\n'
  ), process.exit(1)
);