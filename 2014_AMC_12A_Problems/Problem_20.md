# 2014 AMC 12A Problem 20

## Problem
In $\triangle BAC, \angle BAC=40^\circ, AB=10,$ and AC=6.  Points D and E lie on $\overline{AB}$ and $\overline{AC}$ respectively.  What is the minimum possible value of BE+DE+CD?

$\textbf{(A) }6\sqrt 3+3\qquad \textbf{(B) }\dfrac{27}2\qquad \textbf{(C) }8\sqrt 3\qquad \textbf{(D) }14\qquad \textbf{(E) }3\sqrt 3+9\qquad$
## Solution 1
Let $C_1$ be the reflection of C across $\overline{AB},$ and let $C_2$ be the reflection of $C_1$ across $\overline{AC}.$  Then it is well-known that the quantity BE+DE+CD is minimized when it is equal to $C_2B$.  (Proving this is a simple application of the triangle inequality; for an example of a simpler case, see Heron's Shortest Path Problem.)  As A lies on both AB and AC, we have $C_2A=C_1A$=CA=6.  Furthermore, $\angle CAC_1=2\angle CAB=80^\circ$ by the nature of the reflection, so $\angle C_2AB=\angle C_2AC+\angle CAB=80^\circ+40^\circ=120^\circ.$  Therefore by the Law of Cosines BC_$2^2=6^2+10^2-2\cdot 6\cdot 10\cos 120^\circ=196\implies BC_2=\boxed{\textbf{(D) }14}.$
## Solution 2
In $\triangle BAC,$ the three lines look like the Chinese character 又. Let $\triangle DEA, \triangle CDA,$ and $\triangle BEA$ have bases DE, CD, and BE respectively. Then, $\triangle DEA$ has the same side DA as $\triangle CDA$ and the same side EA as $\triangle BEA.$ Connect all three triangles with $\triangle DEA$ in the center and the two triangles sharing one of its sides. Then, \pentagon BACDE is formed with BE+DE+CD forming the base.

Intuitively, the pentagon's base is minimized when all three bottom sides are collinear. This is simply the original $\triangle BAC$ except that $\angle BAC =120^\circ. ($In $\triangle DEA, \triangle CDA,$ and $\triangle BEA, \angle A = 40^\circ,$ and the three triangles connect at A to form the pentagon). Thus, $m\angle BAC = 40 \cdot 3).$

BC in this new triangle is then the minimum of BE+DE+CD. Applying law of cosines, BC=$\sqrt{6^2+10^2-2(6)(10)\cos (120^\circ)}=\sqrt{196}=14 \implies \boxed{\textbf{(D) }14}$

*~bjhhar*
 Would prime notation be clearer?
## Solution 3
> [Asymptote diagram - not rendered in Markdown]

```asy
size(300); defaultpen(linewidth(0.4)+fontsize(10)); pen s = linewidth(0.8)+fontsize(8); pair A,B,C,D,Ep,Bp,Cp; A = (0,0); B = 10*dir(-110);C = 6*dir(-70); Bp $= 10$*dir(-30);Cp $= 6$*dir(-150); D = IP(Cp--Bp, A--B); Ep = IP(Cp--Bp, A--C); draw(A--B--C--A--Cp--Bp--A); draw(Cp--B); draw(C--Bp); draw(C--D); draw(B--Ep); dot("$A$", A, N); dot("$B$", B, SW); dot("$C$", C, SE); dot("$B'$", Bp, E); dot("$C'$", Cp, W); dot("$D$", D, dir(-70)); dot("$E$", Ep, dir(60)); MA("$40^\circ$",Cp,A,D, 1); MA("$40^\circ$",D,A,Ep, 1); MA("$40^\circ$",Ep,A,Bp, 1); label("$6$", A--Cp); label("$10$", Bp--A);
```


(Diagram by shihan)
Reflect C across AB to C'. Similarly, reflect B across AC to B'. Clearly, BE = B'E and CD = C'D. Thus, the sum BE + DE + CD = B'E + DE + C'D. This value is minimized when B', C', D and E are collinear. To finish, we use the law of cosines on the triangle AB'C': B'C' = $\sqrt{6^2 + 10^2 - 2(6)(10)\cos 120^{\circ}} = \boxed{\textbf{(D) } 14}.$

Note (note by JiYang): $\quad \because \angle BAC$\textless $\frac{\pi}{3}  \qquad \therefore \angle C$'AB' \textless $\pi \qquad \therefore$ the line C'B' would pass through $\Delta ABC$
## Remark
This problem is similar to [https://en.wikipedia.org/wiki/Fagnano%27s_problem Fagnano's Problem].

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## See Also
