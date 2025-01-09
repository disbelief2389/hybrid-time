import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startWork, pauseWork, takeBreak, resetTimer, toggleResumeMode } from '@/src/timer';

const Timer = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    const loadTime = async () => {
      const savedTime = await AsyncStorage.getItem('workDuration');
      if (savedTime) {
        setTime(parseInt(savedTime, 10));
      }
    };
    loadTime();
  }, []);

  useEffect(() => {
    const saveTime = async () => {
      await AsyncStorage.setItem('workDuration', time.toString());
    };
    saveTime();
  }, [time]);

  return (
    <View>
      <Text>{time} seconds</Text>
      <Button title={isRunning ? "Pause" : "Start"} onPress={() => {
        if (isRunning) {
          pauseWork();
        } else {
          startWork();
        }
        setIsRunning(!isRunning);
      }} />
      <Button title="Reset" onPress={resetTimer} />
      <Button title="Toggle Resume Mode" onPress={toggleResumeMode} />
    </View>
  );
};

export default Timer;