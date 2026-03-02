# 2015 AMC 12A Problem 17

> This problem is the same as [2015 AMC 12A #17](https://artofproblemsolving.com/wiki/index.php/2015_AMC_12A_Problems) and [2015 AMC 10A #22](https://artofproblemsolving.com/wiki/index.php/2015_AMC_10A_Problems).
## Problem
Eight people are sitting around a circular table, each holding a fair coin. All eight people flip their coins and those who flip heads stand while those who flip tails remain seated. What is the probability that no two adjacent people will stand?

$\textbf{(A)}\dfrac{47}{256}\qquad\textbf{(B)}\dfrac{3}{16}\qquad\textbf{(C) }\dfrac{49}{256}\qquad\textbf{(D) }\dfrac{25}{128}\qquad\textbf{(E) }\dfrac{51}{256}$
## Solution 1
We will count how many valid standing arrangements there are (counting rotations as distinct), and divide by $2^8 = 256$ at the end. We casework on how many people are standing.

Case $1:0$ people are standing. This yields $1$ arrangement.

Case $2:1$ person is standing. This yields $8$ arrangements.

Case $3:2$ people are standing. This yields $\dbinom{8}{2} - 8 = 20$ arrangements, because the two people cannot be next to each other.

Case $5:4$ people are standing. Then the people must be arranged in stand-sit-stand-sit-stand-sit-stand-sit fashion, yielding $2$ possible arrangements.

More difficult is:

Case $4:3$ people are standing. First, choose the location of the first person standing ($8$ choices). Next, choose $2$ of the remaining people in the remaining $5$ legal seats to stand, amounting to $6$ arrangements considering that these two people cannot stand next to each other. However, we have to divide by $3,$ because there are $3$ ways to choose the first person given any three. This yields $\dfrac{8 \cdot 6}{3} = 16$ arrangements for Case $4.$

Alternate Case $4:$ Use complementary counting. Total number of ways to choose 3 people from 8 which is $\dbinom{8}{3}$. Sub-case $1:$ three people are next to each other which is $\dbinom{8}{1}$. Sub-case $2:$ two people are next to each other and the third person is not $\dbinom{8}{1}\dbinom{4}{1}$. This yields $\dbinom{8}{3} - \dbinom{8}{1} - \dbinom{8}{1} \dbinom{4}{1} = 16$

Summing gives $1 + 8 + 20 + 2 + 16 = 47,$ and so our probability is $\boxed{\textbf{(A) } \dfrac{47}{256}}$.

Alternate: (Quicksolve) - We know that for case 5, there are 8 ways to choose the first person, and 3 ways to choose the first person given any 3 - which means that for the case, there is 8 * something divided by 3. The sum of the other cases is 31/256. Thus, add a multiple of 8 to 31 to get an answer. The options are $31 + 8 = 39, 31 + 16 = 47, 31 + 24 = 55$, etc. The only possible answer is 47/256.
## Solution 1.5 (solution 1 but with visuals)
**Case 1:** Everyone flips tails

1 way:
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(50);
```

import graph;


> [Asymptote diagram - not rendered in Markdown]

```asy
real R = 0.5;            // Radius of big circle
real $r = 0.05$;         // Radius of small circles
int $n = 8$;             // Number of small circles
```


// Draw big circle

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle((0,0), R), linewidth(1));
```


// Place small circles on circumference
for (int $i = 0$; i < n; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
real angle = 2*pi*i/n;
pair center = R * dir(degrees(angle));
draw(Circle(center, r), linewidth(0.8));
```

}
</asy>


**Case 2:** One person flips heads

8 ways:
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(400);
```

import graph;


> [Asymptote diagram - not rendered in Markdown]

```asy
real R = 1.5;            // Radius of big circle
real $r = 0.2$;           // Radius of small circles
int $n = 8$;               // Number of small circles
```


for (int $j = 0$; j < 8; ++j) {

> [Asymptote diagram - not rendered in Markdown]

```asy
pair centerOffset = (j * 4, 0);  // space between diagrams
```


  // Draw big circle

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(shift(centerOffset) * Circle((0,0), R), linewidth(1));
```


  // Draw small circles
  for (int $i = 0$; i < n; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
real angle = 2 * pi * i / n;
pair pos = R * dir(degrees(angle));
pair finalPos = centerOffset + pos;
```


$$if (i == j) {$$

> [Asymptote diagram - not rendered in Markdown]

```asy
fill(Circle(finalPos, r), black); // Shade this one
```

    } else {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(finalPos, r), linewidth(0.8)); // Outline others
```

    }
  }
}
</asy>

**Case 3:** Two people flip heads

There are $\binom{8}{2}$ ways to choose any $2$ people in the circle and $8$ ways to choose $2$ people adjacent to each other. So this case gives us $\binom{8}{2} - 8 = 20$ ways. An example of choosing two nonadjacent people is shown below.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(50);
```

import graph;


> [Asymptote diagram - not rendered in Markdown]

```asy
real R = 0.5;            // Radius of big circle
real $r = 0.05$;           // Radius of small circles
int $n = 8$;               // Number of small circles
```


// Indices of two circles that are one circle apart

> [Asymptote diagram - not rendered in Markdown]

```asy
int $a = 0$;
int $b = 2$;
```


// Compute centers of these two circles

> [Asymptote diagram - not rendered in Markdown]

```asy
real angleA = 2*pi*a/n;
real angleB = 2*pi*b/n;
```


> [Asymptote diagram - not rendered in Markdown]

```asy
pair centerA = R * dir(degrees(angleA));
pair centerB = R * dir(degrees(angleB));
```


// Draw big circle

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle((0,0), R), linewidth(1));
```


// Draw small circles and shade the two chosen ones
for (int $i = 0$; i < n; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
real angle = 2*pi*i/n;
pair center = R * dir(degrees(angle));
if (i
## a || i
b) {
fill(Circle(center, r), black);
```

  } else {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(center, r), linewidth(0.8));
```

  }
}

// Draw line connecting the two shaded circles

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(centerA -- centerB, linewidth(1));
```

</asy>


**Case 4:** Three people flip heads

We can choose the first person (shaded gray) in $8$ ways. We can choose the other $2$ people in $6$ ways (purple-blue, yellow-red, green-yellow, green-blue, purple-red, green-red). We divide by $3$ for overcounting to get $\frac{8 \cdot 6}{3} = 16$ ways for this case.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(50);
```

import graph;


> [Asymptote diagram - not rendered in Markdown]

```asy
real R = 1.5;   // Radius of big circle
real $r = 0.2$;   // Radius of small circles
int $n = 8$;      // Number of small circles
```


> [Asymptote diagram - not rendered in Markdown]

```asy
pair center = (0, 0);
```


// Draw big circle

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(center, R), linewidth(1));
```


// Compute positions (clockwise, starting at top)
pair[] pts;
for (int $i = 0$; i < n; ++i) {

> [Asymptote diagram - not rendered in Markdown]

```asy
real angle = 90 - 360 * i / n; // Start at 90° and go clockwise
```

  pts[i] = center + R * dir(angle);
}

// Draw circles with unique colors for shaded ones
for (int $i = 0$; i < n; ++i) {
$$if (i == 0) {$$

> [Asymptote diagram - not rendered in Markdown]

```asy
fill(Circle(pts[i], r), gray);     // Circle 1
} else if (i == 2) {
fill(Circle(pts[i], r), red);      // Circle 3
} else if (i == 3) {
fill(Circle(pts[i], r), blue);     // Circle 4
} else if (i == 4) {
fill(Circle(pts[i], r), yellow);   // Circle 5
} else if (i == 5) {
fill(Circle(pts[i], r), purple);   // Circle 6
} else if (i == 6) {
fill(Circle(pts[i], r), green);    // Circle 7
```

  } else {

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(pts[i], r), linewidth(0.8)); // Others outlined only
```

  }
}

// Draw triangle connecting circles 1, 4, 6 (indices 0, 3, 5)

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(pts[0] -- pts[3] -- pts[5] -- cycle, linewidth(1));
```

</asy>

**Case 5:** 4 people flip heads

2 ways (we can either choose the people shaded in red or blue)

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(50);
```

import graph;


> [Asymptote diagram - not rendered in Markdown]

```asy
real R = 1.5;
real $r = 0.15$;
```


// Circle centers, clockwise starting at top

> [Asymptote diagram - not rendered in Markdown]

```asy
pair c0 = (0, R);
pair c1 = R * dir(45);
pair c2 = R * dir(90 - 2*45);
pair c3 = R * dir(90 - 3*45);
pair c4 = R * dir(90 - 4*45);
pair c5 = R * dir(90 - 5*45);
pair c6 = R * dir(90 - 6*45);
pair c7 = R * dir(90 - 7*45);
```


// Draw big circle

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle((0,0), R), linewidth(1));
```


// Group 1 vertices (blue)
pen bluePen = blue + linewidth(1.5);

> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(Circle(c0, r), blue);
filldraw(Circle(c2, r), blue);
filldraw(Circle(c4, r), blue);
filldraw(Circle(c6, r), blue);
draw(c0--c2--c4--c6--c0, bluePen);
```


// Group 2 vertices (red)
pen redPen = red + linewidth(1.5);

> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw(Circle(c1, r), red);
filldraw(Circle(c3, r), red);
filldraw(Circle(c5, r), red);
filldraw(Circle(c7, r), red);
draw(c1--c3--c5--c7--c1, redPen);
```

</asy>

It's impossible to have more than 4 people standing without anyone being next to each other, so we stop here.

The total number of ways is $2^8,$ so the answer is $\frac{1 + 8 + 20 + 16 + 2}{2^8} = \boxed{\frac{47}{256}}.$

*~grogg007*
## Solution 2
We will count how many valid standing arrangements there are counting rotations as distinct and divide by $256$ at the end.
Line up all $8$ people linearly.  In order for no two people standing to be adjacent, we will place a sitting person to the right of each standing person.  In effect, each standing person requires $2$ spaces and the standing people are separated by sitting people.  We just need to determine the number of combinations of pairs and singles and the problem becomes very similar to pirates and gold aka stars and bars aka sticks and stones aka balls and urns.

If there are $4$ standing, there are ${4 \choose 4}=1$ ways to place them.
For $3,$ there are ${3+2 \choose 3}=10$ ways.
etc.
Summing, we get ${4 \choose 4}+{5 \choose 3}+{6 \choose 2}+{7 \choose 1}+{8 \choose 0}=1+10+15+7+1=34$ ways.

Now we consider that the far right person can be standing as well, so we have
${3 \choose 3}+{4 \choose 2}+{5 \choose 1}+{6 \choose 0}=1+6+5+1=13$ ways

Together we have $34+13=47$, and so our probability is $\boxed{\textbf{(A) } \dfrac{47}{256}}$.
## Solution 3 (Recursion)
Because the denominator is always $256$, we can count the numerator with a recursion. Define $c_n$ and $r_n$ as the number of satisfying arrangements on a circle and row with $n$ seats, respectively.

Then, observe that

$$c_n=r_{n-1}+r_{n-3}$$



$$r_n=r_{n-1}+r_{n-2}$$


(From casework on whether the $n$th position has $T$ or $H$.).

Because $r_0=1, r_1=2$, we can continue to write out each $r_i$ and hence find $c_8=47$. Our answer is then $\boxed{\textbf{(A) } \dfrac{47}{256}}$.
## Solution 4 (Recursion)
We know that the denominator of the probability is $2^8=256$. So now we only have to calculate the numerator, which is the number of arrangements for $8$ people at a round table without $2$ or more neighboring people standing.

Denote $a_n$ as number of arrangements for $n$ people at a round table without $2$ or more neighboring people standing. We can see that $a_2=$3, $a_3=4$, we are going to prove $a_n=a_{n-1}+a_{n-2}$

We use $1$ to represent standing people, and $0$ as sitting people. The problem becomes arranging $n$ numbers of $0$ or $1$ around a circle with no consecutive $1$'s.

We elect one person as the chairman, let him be $p_1$, the first element in this circular sequence.
There are $2$ cases to generate the arrangement of $n$ numbers.

$Case1:$ From the arrangement of $n-1$ numbers, add $1$ more number $p_n$ counter-clockwise next to $p_1$.

If $p_1=1, p_{n-1}p_np_1$ is $001$, as the diagram shows:

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle((0, 0), 5));
pair A, B, C;
A=(0, 5);
B=rotate(72)*A;
C=rotate(144)*A;
label("$p_1=1$", A, N);
label("$p_n=0$", B, NW);
label("$p_{n-1}=0$", C, SW);
```

</asy>

If $p_1=0, p_{n-1}p_np_1$ is $X00, X$ could be $0$ or $1$, as the diagram shows:

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle((0, 0), 5));
pair A, B, C;
A=(0, 5);
B=rotate(72)*A;
C=rotate(144)*A;
label("$p_1=0$", A, N);
label("$p_n=0$", B, NW);
label("$p_{n-1}=X$", C, SW);
```

</asy>

$Case2:$ From the arrangement of $n-2$ numbers, add $2$ more numbers $p_{n-1}$ and $p_n$ counter-clockwise next to $p_1$.

If $p_1=1$, then $p_{n-2}=0$, let $p_{n-1}=1, p_n=0, p_{n-1}p_np_1$ is $101$, as the diagram shows:

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle((0, 0), 5));
pair A, B, C;
A=(0, 5);
B=rotate(72)*A;
C=rotate(144)*A;
label("$p_1=1$", A, N);
label("$p_n=0$", B, NW);
label("$p_{n-1}=1$", C, SW);
```

</asy>

If $p_1=0$, then $p_{n-2}$ could be $0$ or $1$. Let $p_{n-1}=0, p_n=1, p_{n-1}p_np_1$ is $010$, as the diagram shows:

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle((0, 0), 5));
pair A, B, C;
A=(0, 5);
B=rotate(72)*A;
C=rotate(144)*A;
label("$p_1=0$", A, N);
label("$p_n=1$", B, NW);
label("$p_{n-1}=0$", C, SW);
```

</asy>

From the above $2$ cases and the $4$ diagrams, the arrangements of $p_{n-1}p_np_1$ are mutually exclusive collectively exhaustive, so $a_{n}=a_{n-1}+a_{n-2}$
 $a_2=3$
 $a_3=4$
 $a_4=7$
 $a_5=11$
 $a_6=18$
 $a_7=29$
 $a_8=47$

The answer is $\boxed{\textbf{(A) } \dfrac{47}{256}}$

This sequence of numbers is called [https://en.wikipedia.org/wiki/Lucas_number Lucas Number].

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 5 (Recursion)
Note that there are $2^8=256$ cases in total, so it suffices to find the number of satisfying cases. Define $h_n$ and $t_n$ as sequences of $h$’s and $t$’s where no $2h$’s are adjacent. The sequences will end in $h$ and $t$, respectively (ignore the fact that they are in a circle for now).

In order for a sequence to end in $h$, the previous term has to be a $t$; a sequence with a length of $n$ ending in $h$ is equivalent to adding $h$ to the end of a sequence of length $n-1$ that ends with $t$. This means $h_n=t_{n-1}$.

In order for a sequence to end in $t$, the previous term can be $h$ or $t$, so $t_n=t_{n-1}+h_{n-1}$.

Now, we have to take account of the circle. Notice that $t_n$ does not depend on if the people are in a circle or not, but $h_n$ does. To guarantee that some sequence that ends with $h$ does not start with $h$, we have to add a $t$ in the beginning of the sequence. Since there are $n-1$ terms left, there are $h_{n-1}$ sequences which end with $h$ that satisfy the circle condition.

The length of our sequence is $8$, so we need to find $t_8+h_7$. Manipulating our recursions, we can find that $t_n=t_{n-1}+t_{n-2}$. Now, we proceed to find our terms.

$t_1=1$

$t_2=2$

$t_3=3$

$t_4=5$

$t_5=8$

$t_6=13$

$t_7=21$

$t_8=34$

Since $h_7=t_6$ due to the fact that $h_n=t_{n-1}$, our answer is $\frac{34+13}{256}=\boxed{\textbf{(A) } \dfrac{47}{256}}$.

*~kn07*
## Solution 6 (big fas)
There can be 0, 1, 2, 3, or 4 people standing up.

0 people standing up : 1 way


1 person standing up : 8 ways


2 people standing up : 8 for the first, 5 for the second, divide by 2 for double count, 20 ways.


3 people standing up : we can start drawing, and notice we can only have gaps of (1,1,3) or (2,2,1). Rotating, we get $8+8=16$.


4 people standing up : must be alternating all the way through. 2 ways

$1+8+20+16+2 = 47$, since there are $2^8=256$ ways total, the answer is $\boxed{\textbf{(A)}\frac{47}{256}}$

*~skibbysiggy*
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=krlnSWWp0I0
## See Also
