# 2021 AMC 12A Problem 20

## Problem
Suppose that on a parabola with vertex V and a focus F there exists a point A such that AF=20 and AV=21. What is the sum of all possible values of the length FV?

$\textbf{(A) }13 \qquad \textbf{(B) }\frac{40}3 \qquad \textbf{(C) }\frac{41}3 \qquad \textbf{(D) }14\qquad \textbf{(E) }\frac{43}3$
## Solution 1
Let \ell be the directrix of $\mathcal P$; recall that $\mathcal P$ is the set of points T such that the distance from T to \ell is equal to TF. Let P and Q be the orthogonal projections of F and A onto \ell, and further let X and Y be the orthogonal projections of F and V onto AQ. Because AF < AV, there are two possible configurations which may arise, and they are shown below.


> [Asymptote diagram - not rendered in Markdown]

```asy
import olympiad; size(230); defaultpen(linewidth(0.8)+fontsize(11pt)); real $d = 1.1$, edge = 2.5, Ax $= 1$.6; real f(real x) { return 1/(4*d) * x * x; } pair V = origin, F = (0,d), la = (-edge,-d), lb = (edge,-d), A = (Ax, f(Ax)); pair P = foot(F,la,lb), Q = foot(A,la,lb), X = foot(F,A,Q), Y = foot(V,A,Q); draw(P--F--A--V--Y^^F--X--Q^^rightanglemark(F,P,la,4)^^rightanglemark(A,Q,lb,4)^^rightanglemark(A,X,F,4)^^rightanglemark(A,Y,V,4),red); draw(graph(f,-2.5,2.5)); draw(la -- lb); dot(F^^A^^V); label("$F$",F,NW); label("$V$",V,SW); label("$A$",A,dir(F--A)); label("$P$",P,S,red); label("$Q$",Q,S,red); label("$X$",X,E,red); label("$Y$",Y,E,red);
import olympiad; size(200); defaultpen(linewidth(0.8)+fontsize(11pt)); real $d = 0.7$, edge = 2.5, Ax $= 1$.9; real f(real x) { return 1/(4*d) * x * x; } pair V = origin, F = (0,d), la = (-edge,-d), lb = (edge,-d), A = (Ax, f(Ax)); pair P = foot(F,la,lb), Q = foot(A,la,lb), X = foot(F,A,Q), Y = foot(V,A,Q); draw(Q--A--F--P^^F--X^^A--V--Y^^rightanglemark(F,P,la,4)^^rightanglemark(A,Q,lb,4)^^rightanglemark(A,X,F,4)^^rightanglemark(A,Y,V,4),red); draw(la -- lb); draw(graph(f,-2.5,2.5)); dot(F^^A^^V); label("$F$",F,NW); label("$V$",V,SW); label("$A$",A,dir(F--A)); label("$P$",P,S,red); label("$Q$",Q,S,red); label("$X$",X,E,red); label("$Y$",Y,E,red);
```

Set d = FV, which by the definition of a parabola also equals VP. Then as AQ = AF = 20, we have AY = 20 - d and AX = |20 - $2d$|. Since FXYV is a rectangle, FX = VY, so by Pythagorean Theorem on triangles AFX and AVY,

$$
\begin{align*} 21^2 - (20 - d)^2 &= AV^2 - AY^2 = VY^2\\ &= FX^2 = AF^2 - AX^2 = 20^2 - (20 - 2d)^2 \end{align*}
$$

This equation simplifies to $3d^2-40d + 41 = 0$, which has solutions $d =\tfrac{20\pm\sqrt{277}}3.$ Both values of d work - the smaller solution with the bottom configuration and the larger solution with the top configuration - and so the requested answer is $\boxed{\textbf{(B)}\ \tfrac{40}{3}}.$
## Solution 2
Let $\mathcal{P}$ be the parabola, let V be the origin, F lie on the positive y axis, and d=FV. The equation of the parabola is then $x^{2}=4$dy. If the coordinates of A are (p, q), then $p^{2}+q^{2}=441$ since the distance from the origin to A is 21. Note also that the parabola is the set of all points equidistant from F and a line known as its directrix, which in this case is a horizontal line d units below the origin. Since the distance from A to its directrix is equal to AF, then A is 20 units above this line and therefore $q=20$-d. Substituting for p and q yields $4d(20-d)$+(20-$d)^{2}=441$ or (20-d)(20+$3d$)=441, which simplifies to $3d^{2}-40d+41=0$. Therefore the sum of all possible values of d is $\tfrac{-b}{a}=\boxed{\textbf{(B)} ~\tfrac{40}{3}}$ by Viète's Formulas.

*~sugar_rush*
## Video Solution by OmegaLearn (Using parabola properties and system of equations)
https://youtu.be/DcaD9vvcKL0

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/WidS_IOjkQo

*~IceMatrix*
## See also
