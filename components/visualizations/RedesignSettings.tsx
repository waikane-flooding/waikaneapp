import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function RedesignSettings({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  const toggle = (key: string) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Display</ThemedText>
      <View style={styles.row}>
        <Text style={styles.label}>Waikāne</Text>
        <Switch value={!!value.waikane} onValueChange={() => toggle('waikane')} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Waiāhole</Text>
        <Switch value={!!value.waiahole} onValueChange={() => toggle('waiahole')} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Punaluʻu</Text>
        <Switch value={!!value.punaluu} onValueChange={() => toggle('punaluu')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 16,
    color: '#1D3D47',
  },
});
