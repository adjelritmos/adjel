import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { HEIGHT } from '../data/layout'
import { calibrate, findBones, retarget } from '../functions/retarget'

// Avatar realista (GLB). É animado pelo esqueleto procedural através de rig.avatarUpdate().
export function RealAvatar({ url, rig }) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => clone(scene), [scene])

  useLayoutEffect(() => {
    // escala para 1,63 m e assenta os pés no chão
    model.position.set(0, 0, 0)
    model.rotation.set(0, 0, 0)
    model.scale.setScalar(1)
    model.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(model)
    const s = HEIGHT / (box.max.y - box.min.y)
    model.scale.setScalar(s)
    model.position.y = -box.min.y * s

    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
        o.frustumCulled = false
      }
    })

    const bones = findBones(model)
    // o controlador olha para +z: o braço esquerdo tem de ficar em +x
    if (bones.leftArm && bones.rightArm) {
      model.updateMatrixWorld(true)
      const l = bones.leftArm.getWorldPosition(new THREE.Vector3())
      const r = bones.rightArm.getWorldPosition(new THREE.Vector3())
      if (l.x < r.x) model.rotation.y = Math.PI
    }
    const cal = calibrate(model, bones, { headWidth: 0.93 }) // o rosto do Adjel é mais fino
    rig.avatarUpdate = () => retarget(rig, bones, cal, rig)
    return () => {
      rig.avatarUpdate = null
    }
  }, [model, rig])

  return <primitive object={model} />
}
