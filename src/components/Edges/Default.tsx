import { EdgeProps, getSmoothStepPath } from "reactflow";

export function Default({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected, // Prop otomatis dari React Flow saat edge diklik
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Path "Hitbox": 
                Dibuat transparan tapi tebal (strokeWidth 15) 
                supaya user gampang nge-klik garis yang tipis.
            */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={15}
        stroke="transparent"
        className="cursor-pointer"
      />

     
      <path
        id={id}
        style={style}
        d={edgePath}
        markerEnd={markerEnd}
        className={`
                    fill-none transition-all duration-200 cursor-pointer
                    ${selected
            ? 'stroke-red-200 stroke-[3px] drop-shadow-sm'
            : 'stroke-zinc-300 stroke-2'
          }
                `}
      />
    </>
  );
}