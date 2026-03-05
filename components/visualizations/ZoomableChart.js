/**
 * ZoomableChart
 * Wraps any chart in a tappable card. Tapping opens a full-screen modal.
 * Native: pinch-to-zoom + drag-to-pan + double-tap-to-reset via PanResponder.
 * Web: nested ScrollViews for horizontal + vertical panning.
 * Zero third-party gesture imports — uses only built-in RN Animated + PanResponder.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  Text,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native';

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ─── Native pinch + pan view (pure PanResponder + Animated) ──────────────
function PinchPanView({ children }) {
  const scale      = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const st = useRef({
    scale: 1, tx: 0, ty: 0,
    lastTapTs: 0,
    pinchDist: null, scaleAtStart: 1,
    panStartTx: 0,   panStartTy: 0,
  }).current;

  function getTouchDist(touches) {
    const [a, b] = touches;
    return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  }

  function springReset() {
    st.scale = 1; st.tx = 0; st.ty = 0;
    Animated.parallel([
      Animated.spring(scale,      { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:       () => true,
      onMoveShouldSetPanResponder:        () => true,
      onShouldBlockNativeResponder:       () => false,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        st.panStartTx = st.tx;
        st.panStartTy = st.ty;

        if (touches.length >= 2) {
          st.pinchDist    = getTouchDist(touches);
          st.scaleAtStart = st.scale;
        } else {
          st.pinchDist = null;
          // Double-tap detection
          const now = Date.now();
          if (now - st.lastTapTs < 300) springReset();
          st.lastTapTs = now;
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length >= 2 && st.pinchDist) {
          // ── Pinch ──
          const d = getTouchDist(touches);
          const next = clamp(st.scaleAtStart * (d / st.pinchDist), MIN_SCALE, MAX_SCALE);
          st.scale = next;
          scale.setValue(next);
        } else if (touches.length === 1) {
          // ── Pan ──
          const nx = st.panStartTx + gestureState.dx;
          const ny = st.panStartTy + gestureState.dy;
          st.tx = nx; st.ty = ny;
          translateX.setValue(nx);
          translateY.setValue(ny);
        }
      },

      onPanResponderRelease: () => {
        st.pinchDist = null;
        if (st.scale <= MIN_SCALE) springReset();
      },
    })
  ).current;

  return (
    <Animated.View
      style={{ transform: [{ translateX }, { translateY }, { scale }] }}
      {...responder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

// ─── ZoomableChart ────────────────────────────────────────────────────────
export default function ZoomableChart({
  children,
  renderZoomContent,
  compactWidth  = 650,
  compactHeight = 300,
}) {
  const [open, setOpen] = useState(false);

  const zoomW = Platform.OS === 'web'
    ? Math.min(compactWidth  * 1.8, 1100)
    : Math.min(compactWidth  * 1.6, 1000);
  const zoomH = Platform.OS === 'web'
    ? Math.min(compactHeight * 1.8, 800)
    : Math.min(compactHeight * 1.6, 700);

  return (
    <View style={styles.wrapper}>
      {/* Tap compact chart → open modal */}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Tap to enlarge chart"
      >
        {children}
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        {/* Dark backdrop — tap to close */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Modal card — absorbs touches so backdrop doesn't fire */}
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHint}>
                {Platform.OS === 'web'
                  ? 'Scroll to pan  ·  Tap outside to close'
                  : 'Pinch to zoom  ·  Drag to pan  ·  Double-tap to reset'}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close enlarged chart"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* Chart area */}
            {Platform.OS === 'web' ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={{ width: zoomW }}
                style={{ flexGrow: 0 }}
              >
                <ScrollView
                  showsVerticalScrollIndicator
                  contentContainerStyle={{ height: zoomH }}
                  style={{ flexGrow: 0 }}
                >
                  {renderZoomContent?.({ width: zoomW, height: zoomH })}
                </ScrollView>
              </ScrollView>
            ) : (
              <View style={styles.chartClip}>
                <PinchPanView>
                  <View style={{ width: zoomW, height: zoomH }}>
                    {renderZoomContent?.({ width: zoomW, height: zoomH })}
                  </View>
                </PinchPanView>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 18,
  },
  chartClip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
