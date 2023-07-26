import { Box, Text, useColorModeValue, Select, Spinner } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import LoaderComponent from './Loader';

interface AreaProps {
  data: MappedDataItem[];
  xField: string;
  yField: string;
  color: string[];
  seriesField: string;
  xAxis: {
    range: number[];
    tickCount: number;
  };
  areaStyle: {
    fillOpacity: number;
  };
  legend: any; // Adjust the type based on the actual props required by the library
  smooth: boolean;
}

const Area = dynamic(
  (): any => import('@ant-design/plots').then((item) => item.Area),
  {
    ssr: false,
  }
) as React.ComponentType<AreaProps>;

interface MappedDataItem {
  category: string;
  date: string;
  value: number;
}

interface EIP {
  status: string;
  eips: {
    category: string;
    month: number;
    year: number;
    date: string;
    count: number;
  }[];
}

interface FormattedEIP {
  category: string;
  date: string;
  value: number;
}

function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return months[month - 1];
}

const categoryColors: string[] = [
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(255, 99, 255)',
  'rgb(50, 205, 50)',
  'rgb(255, 0, 0)',
  'rgb(0, 128, 0)',
];
const categoryBorder: string[] = [
  'rgba(255, 99, 132, 0.2)',
  'rgba(255, 159, 64, 0.2)',
  'rgba(255, 205, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(255, 99, 255, 0.2)',
  'rgba(50, 205, 50, 0.2)',
  'rgba(255, 0, 0, 0.2)',
  'rgba(0, 128, 0, 0.2)',
];

const AreaC = () => {
  const [data, setData] = useState<EIP[]>([]); // Set initial state as an empty array
  const [selectedStatus, setSelectedStatus] = useState('Draft'); // Set default select option as 'Final'
  const [isChartReady, setIsChartReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/graphs`);
        console.log(response)
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true); // Set isLoading to true before rendering chart
    setTimeout(() => {
      setIsLoading(false); // Set isLoading to false after a small delay (simulating chart rendering)
    }, 1000);
  }, [selectedStatus]);

  useEffect(() => {
    setIsChartReady(true);
  }, []); // Trigger initial render

  useEffect(() => {
    setIsChartReady(false); // Set chart ready state to false before re-rendering
    setTimeout(() => {
      setIsChartReady(true); // Trigger chart re-render after a small delay
    }, 100);
  }, [selectedStatus]);

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };
  
  const formattedData = data.reduce((acc: FormattedEIP[], item: EIP) => {
    if (item.status === selectedStatus) {
      const formattedEIPs: FormattedEIP[] = item.eips.map(eip => ({
        category: eip.category,
        date: `${getMonthName(eip.month)} ${eip.year}`,
        value: eip.count
      }));
      acc.push(...formattedEIPs);
    }
    return acc;
  }, []);
  
  const filteredData: FormattedEIP[] = formattedData;

  const config = {
    data: filteredData,
    xField: 'date',
    yField: 'value',
    color: categoryColors,
    seriesField: 'category',
    xAxis: {
      range: [0, 1],
      tickCount: 5,
    },
    areaStyle: { fillOpacity: 0.6 },
    legend: { position: 'top-right' },
    smooth: true,
    slider: {
      start: 0.1,
      end: 0.9,
    },
  };

  const bg = useColorModeValue('#f6f6f7', '#171923');

  return (
    <Box
      bgColor={bg}
      marginTop="6"
      paddingEnd="6"
      p="1rem 1rem"
      borderRadius="0.55rem"
      overflowX="auto"
      _hover={{
        border: '1px',
        borderColor: '#10b981',
      }}
      className=" ease-in duration-200"
    >
      <Text fontSize="xl" fontWeight="bold" color="#10b981" marginRight="6">
        {`Status: ${selectedStatus}`}
      </Text>
      <Select
        variant="outline"
        placeholder="Select Option"
        value={selectedStatus}
        onChange={handleChangeStatus}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
        size="sm" // Set the select size to small
      >
        <option value="Final">Final</option>
        <option value="Review">Review</option>
        <option value="Last Call">Last Call</option>
        <option value="Stagnant">Stagnant</option>
        <option value="Draft">Draft</option>
        <option value="Living">Living</option>
      </Select>
      <Box>
        {isLoading ? (
          // Show loading spinner while chart is rendering
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <LoaderComponent/>
          </Box>
        ) : (
          // Show chart when it's ready
          <Area {...config} />
        )}
      </Box>
    </Box>
  );
};

export default AreaC;
