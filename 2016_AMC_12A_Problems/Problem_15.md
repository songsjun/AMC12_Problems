# 2016 AMC 12A Problem 15

## Problem
Circles with centers P, Q and R, having radii 1, 2 and 3, respectively, lie on the same side of line l and are tangent to l at P', Q' and R', respectively, with Q' between P' and R'. The circle with center Q is externally tangent to each of the other two circles. What is the area of triangle PQR?

$\textbf{(A) } 0\qquad \textbf{(B) } \sqrt{\frac{2}{3}}\qquad\textbf{(C) } 1\qquad\textbf{(D) } \sqrt{6}-\sqrt{2}\qquad\textbf{(E) }\sqrt{\frac{3}{2}}$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
size(250); defaultpen(linewidth(0.4)); //Variable Declarations pair P,Q,R,Pp,Qp,Rp; pair A,B; //Variable Definitions A=(-5, 0); B=(8, 0); P=(-2.828,1); Q=(0,2); R=(4.899,3); Pp=foot(P,A,B); Qp=foot(Q,A,B); Rp=foot(R,A,B); path PQR = P--Q--R--cycle; //Initial Diagram dot(P); dot(Q); dot(R); dot(Pp); dot(Qp); dot(Rp); draw(Circle(P, 1), linewidth(0.8)); draw(Circle(Q, 2), linewidth(0.8)); draw(Circle(R, 3), linewidth(0.8)); draw(A--B,Arrows); label("$P$",P,N); label("$Q$",Q,N); label("$R$",R,N); label("$P'$",Pp,S); label("$Q'$",Qp,S); label("$R'$",Rp,S); label("$l$",B,E); //Added lines draw(PQR); draw(P--Pp); draw(Q--Qp); draw(R--Rp); //Angle marks draw(rightanglemark(P,Pp,B)); draw(rightanglemark(Q,Qp,B)); draw(rightanglemark(R,Rp,B));
```


Notice that we can find [P'PQRR'] in two different ways: [P'PQQ']+[Q'QRR'] and [PQR]+[P'PRR']. Since we want [PQR], we use the latter method, so we have [P'PQQ']+[Q'QRR']=[PQR]+[P'PRR'].
$$\break$$

P'Q'=$\sqrt{PQ^2-(QQ'-PP')^2}=\sqrt{3^2-1^2}=\sqrt{8}=2\sqrt{2}.$ Additionally, Q'R'=$\sqrt{QR^2-(RR'-QQ')^2}=\sqrt{5^2-1^2}=\sqrt{24}=2\sqrt{6}.$ Therefore, [P'PQQ']=$\frac{P'P+Q'Q}{2}*2\sqrt{2}=\frac{1+2}{2}*2\sqrt{2}=3\sqrt{2}.$ Similarly, [Q'QRR']=$5\sqrt6.$ We can calculate [P'PRR'] easily because P'R'=P'Q'+Q'R'=$2\sqrt{2}+2\sqrt{6}.$ [P'PRR']=$4\sqrt{2}+4\sqrt{6}.$\newline

Plugging into first equation, the two sums of areas, $3\sqrt{2}+5\sqrt{6}=4\sqrt{2}+4\sqrt{6}+$[PQR], so therefore [PQR]=$\boxed{\textbf{(D) }\sqrt{6}-\sqrt{2}.}$
## Solution 2
Use the [Shoelace Theorem](https://artofproblemsolving.com/wiki/index.php/Shoelace_Theorem).

Let the center of the first circle of radius 1 be at (0, 1).

Draw the trapezoid PQQ'P' and using the Pythagorean Theorem, we get that P'Q' = $2\sqrt{2}$ so the center of the second circle of radius 2 is at ($2\sqrt{2}, 2).$

Draw the trapezoid QRR'Q' and using the Pythagorean Theorem, we get that Q'R' = $2\sqrt{6}$ so the center of the third circle of radius 3 is at ($2\sqrt{2}+2\sqrt{6}, 3).$

Now, we may use the [Shoelace Theorem](https://artofproblemsolving.com/wiki/index.php/Shoelace_Theorem)!

(0,1)

$$(2\sqrt{2}, 2)$$

$$(2\sqrt{2}+2\sqrt{6}, 3)$$

$$\frac{1}{2}|(2\sqrt{2}+4\sqrt{2}+4\sqrt{6})-(6\sqrt{2}+2\sqrt{2}+2\sqrt{6})|$$

$$=\boxed{\textbf{(D) }\sqrt{6}-\sqrt{2}.}$$
## Solution 3
PQ = 3 and QR = 5 because they are the sum of two radii. QQ' - PP' = 1 and RR' - QQ' = 1, the difference of the radii. Using pythagorean theorem, we find that P'Q' and Q'R' are $\sqrt{8}$ and $\sqrt{24}, P$'R' = $\sqrt{8} + \sqrt{24}.$

Draw a perpendicular from P to line RR', then we can use the Pythagorean theorem to find PR. RR' - PP' = 2. We get $PR^2 = (\sqrt{8} + \sqrt{24})^2 + 4 = 36 + 16\sqrt{3} \Rightarrow PR = \sqrt{36 + 16\sqrt{3}} = 2\sqrt{9 + 4\sqrt{3}}$

To make our calculations easier, let $\sqrt{9 + 4\sqrt{3}} =$ a. The semi-perimeter of our triangle is $\frac{3 + 5 + 2a}{2} = 4 +$ a. Symbolize the area of the triangle with A. Using Heron's formula, we have $A^2 = (4 + a)(4 + a -2a)(4 + a - 3)(4 + a - 5) = (4 + a)(4 - a)(a + 1)(a - 1) = (16 - a^2)(a^2 - 1)$ We can remove the outer root of $a. A^2 = (16 - 9 -4\sqrt{3})(9 + 4\sqrt{3} - 1) = (7 - 4\sqrt{3})(8 + 4\sqrt{3}) = 8 - 4\sqrt{3} \rightarrow A = \sqrt{8 - 4\sqrt{3}}$

We solve the nested root. We want to turn 8 - $4\sqrt{3}$ into the square of something. If we have $(a - b) ^ 2 = 8 -4\sqrt{3},$ then we get $\begin{cases}a^2 + b^2 = $8 \\ ab = $2\sqrt{3} \end{cases}$ Solving the system of equations, we get a = $\sqrt{6}$ and b = $\sqrt{2}.$ Alternatively, you can square all the possible solutions until you find one that is equal to 8 - $4\sqrt{3}.$\newline A = $\sqrt{8 - 4\sqrt{3}} = \sqrt{(\sqrt{6} - \sqrt{2})^2} = \boxed{\textbf{(D) }\sqrt{6}-\sqrt{2}.}$
*~ZericH*
## Solution 4
> [Asymptote diagram - not rendered in Markdown]

```asy
// Initial Pen Sizing size(250); defaultpen(linewidth(0.4)); defaultpen(fontsize(10pt)); // Variable Declarations pair P,Q,R,Pp,Qp,Rp,X,Y,Z,A,B; // Variable Definitions A=(-5, 0); B=(8, 0); P=(-2.828,1); Q=(0,2); R=(4.899,3); X=(0,1); Y=(4.899,1); Z=(4.899,2); Pp=foot(P,A,B); Qp=foot(Q,A,B); Rp=foot(R,A,B); path PQR = P--Q--R--cycle; //Initial Diagram dot(P); dot(Q); dot(R); dot(Pp); dot(Qp); dot(Rp); dot(X); dot(Y); dot(Z); draw(Circle(P, 1), linewidth(0.3)); draw(Circle(Q, 2), linewidth(0.3)); draw(Circle(R, 3), linewidth(0.3)); draw(A--B,Arrows); label("$P$",P,N); label("$Q$",Q,N); label("$R$",R,N); label("$P'$",Pp,S); label("$Q'$",Qp,S); label("$R'$",Rp,S); label("$l$",B,E); label("$X$",X,NE); label("$Y$",Y,E); label("$Z$",Z,E); //Added lines filldraw(PQR,gray(0.8)); draw(P--Pp,linetype("8 8")); draw(Q--Qp,linetype("8 8")); draw(R--Rp,linetype("8 8")); draw(P--Y,linetype("8 8")); draw(Q--Z,linetype("8 8")); //Angle marks draw(rightanglemark(R,Y,P)); draw(rightanglemark(Q,X,P)); draw(rightanglemark(R,Z,Q)); //Length labeling label("$\sqrt{2}$",P--X,fontsize(8pt)); label("$\sqrt{6}$",X--Y,fontsize(8pt)); label("$\sqrt{6}$",Q--Z,fontsize(8pt)); label("$1$",R--Z,E,fontsize(8pt)); label("$1$",Z--Y,E,fontsize(8pt)); label("$3$",(-2.828,1.3)--Q,W,fontsize(8pt)); label("$5$",Q--R,N,fontsize(8pt));
```

The above diagram can be achieved relatively simply using basic knowledge of the Pythagorean theorem and the fact that the radius from the center to the point of tangency is perpendicular to the tangent line. From there, observe that [PQRY] can be calculated in two ways: [$\triangle PQX$] + [QZYX] + [$\triangle QRZ$] and [$\triangle PRY$] + [$\triangle PQR$]. Solving, we get:

$$
\begin{align*} [\triangle PQR] &= [PQRY] - [\triangle PRY] \\ &= [\triangle PQX] + [QZYX] + [\triangle QRZ] - [\triangle PRY] \\ &= \sqrt{2} + 2\sqrt{6} + \sqrt{6}- 2\sqrt{2}-2\sqrt{6} \\ &= \boxed{\textbf{(D)} \sqrt{6}-\sqrt{2}} \end{align*}
$$


- ColtsFan10, diagram partially borrowed from Solution 1
## Solution 5 (Heron’s)
We can use the Pythagorean theorem to find that the lengths are 3,5,$\sqrt{36+16\sqrt{3}}.$ If we apply Heron’s, we know that it must be the sum (or difference) of two or more square roots, by instinct. This means that $\boxed{\textbf{(D)} \sqrt{6}-\sqrt{2}}$ is the answer.
## Solution 6 (Educated Guess)
Like Solution 1, we can use the Pythagorean theorem to find P'Q' and Q'R', which are $2\sqrt2$ and $2\sqrt6$ respectively. Since the only answer choice that has $\sqrt2$ and $\sqrt6$ is D, we can make an educated guess that $\boxed{\textbf{(D)} \sqrt{6}-\sqrt{2}}$ is the answer.
## Solution 7 (Quickest and Easiest Using Trapezoids)
The fastest way to find the area of [PQR] is by breaking it into shapes with easy-to-calculate areas. We can see that the area of the whole shape [PQRR'P'] is made up of trapezoids [PP'QQ'] and [Q'QRR']. So, [PQR]=[PP'QQ']+[Q'QRR']-[PRR'P'].

We already know the lengths of PP' and QQ' being 1 and 2 respectively (they are the radiuses of the circles). The "height" of the trapezoid is P'Q'=$\sqrt{3^2-1^2}=\sqrt{8}=2\sqrt{2}$ which can be found from the Pythagorean Theorem. So, the area of trapezoid [PP'QQ']=$\frac{1+2}2*{(2\sqrt{2})$}=$3\sqrt{2}.$ Similarly, we can find the area of trapezoid [Q'QRR']. Q'R'=$5\sqrt{6},$ so [Q'QRR']=$\frac{2+3}2*{(2\sqrt{6})$}=$5\sqrt{2}.$

Now we can put the pieces together. [PQR]=[PP'QQ']+[Q'QRR']-[PRR'P']=$3\sqrt{2}+5\sqrt{6}-$[PRR'P']=. The area of PRR'P' is the long rectangle [PR"R'P]'+ [PRR"]=$4\sqrt{2}+4\sqrt{6}. R$" is the point on RR' in which PR" is perpendicular to RR'.

So, [PQR]=$3\sqrt{2}+5\sqrt{6}-(4\sqrt{2}+4\sqrt{6})=\boxed{\textbf{(D) }\sqrt{6}-\sqrt{2}.}$

*~hwan*
## Video Solution 1 by Pi Academy
https://youtu.be/tMVGfNSwLq0?si=TL8gtFQr3xC1Hg1R

*~Pi Academy*
## Video Solution 2
https://www.youtube.com/watch?v=UanfIBpDTh8&ab_channel=ArtofProblemSolving
*~by the official Art of Problem Solving channel on YouTube*
## Video Solution 3
[https://youtu.be/ge6KRHTC8AU?t=467 Simple Explanations, simplexp.org]
## See Also
